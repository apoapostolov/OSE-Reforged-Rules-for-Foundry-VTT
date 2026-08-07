/**
 * Roll pipeline wrappers for Tier 1 passive numeric features.
 *
 * These wrap OseActor methods (rollAttack) so bonuses are applied at the
 * source, matching what the OSE system reads.
 *
 * OSE rollAttack mechanics (verified ose.js:4755):
 *   - rollParts = 1d20 + [bba] + [str.mod, thac0.mod.melee]  (melee)
 *                           + [dex.mod, thac0.mod.missile]   (missile)
 *                           + item.bonus
 *   - dmgParts  = item.damage + [item.bonus] + [str.mod, thac0.mod.melee]
 *     for melee only. OSE pushes the MELEE attack mods into the damage
 *     parts too, so bumping thac0.mod.melee raises BOTH the melee attack
 *     and the melee damage roll.
 *
 * Consequence for this module:
 *   - Attack-only bonuses (Attack Giant Foes) must compensate the melee
 *     damage leak with an inverse adjustment on the damage formula.
 *   - Damage-only bonuses (Harm Giant Foes) go on the damage formula.
 *   - Both-sides bonuses (Precise Strikes: INT to attack AND damage) ride
 *     the melee leak naturally; missile needs the damage formula too.
 *   - Finesse swaps scores.str.mod for scores.dex.mod (covers melee
 *     attack + damage, exactly per the rule).
 *
 * All mutations happen synchronously before the original call; the roll
 * formulas are assembled in the synchronous prologue of rollAttack, so the
 * finally block restores every value before any await. This is the same
 * seam the official Tweaks dialog edits.
 *
 * Giant detection: OSE monsters have no size field (details is ObjectField),
 * so "giant" is detected by name pattern (giant, ogre, troll, ettin) or
 * monster HD >= 8 as a proxy for larger than human-sized.
 */
import { FEATURES, FLAG_ROOT } from "./constants.js";
import { getLevel, hasFeature, hasFinesse, isUsedToday, markUsedToday } from "./helpers.js";

/**
 * Compute the maximum possible total of a simple dice formula like
 * "1d8+2" or "2d6+3". Splits on "+" and "-" terms, treats "NdM" as
 * N*M, flat numbers as themselves. Safe on arbitrary strings (no eval).
 * @param {string|undefined} formula
 * @returns {number}
 */
function maxOfFormula(formula) {
  if (!formula) return 0;
  let total = 0;
  let sign = 1;
  for (const part of String(formula).split(/([+-])/)) {
    const t = part.trim();
    if (t === "+") { sign = 1; continue; }
    if (t === "-") { sign = -1; continue; }
    if (!t) continue;
    const die = t.match(/^(\d*)d(\d+)$/i);
    if (die) {
      const count = die[1] ? Number.parseInt(die[1], 10) : 1;
      total += sign * count * Number.parseInt(die[2], 10);
    } else {
      total += sign * (Number.parseInt(t, 10) || 0);
    }
  }
  return total;
}

const GIANT_RE = /\b(giant|ogre|troll|ettin|cyclops|golem|hydra)\b/i;

/**
 * True when the target actor qualifies as "larger than human-sized".
 * @param {Actor|null} actor
 * @returns {boolean}
 */
export function isGiant(actor) {
  if (!actor) return false;
  if (actor.type !== "monster") return false;
  if (GIANT_RE.test(actor.name)) return true;
  const hd = Number.parseInt(actor.system?.hp?.hd, 10);
  return Number.isFinite(hd) && hd >= 8;
}

/* ---------------------------------------------------------------- */
/*  rollAttack wrapper                                               */
/* ---------------------------------------------------------------- */

const _patching = new WeakSet();

/**
 * Wrap OseActor#rollAttack. Applies, per house rules:
 *  - Attack Giant Foes (Dwarf):  +2 attack vs giants
 *  - Harm Giant Foes (Duergar):  +2 damage vs giants
 *  - Finesse (Drow/Elf/Half-Elf): DEX instead of STR on melee
 *  - Precise Strikes (Sage):     INT mod to attack and damage
 * @param {Function} original
 */
export function patchRollAttack(original) {
  return async function rollAttack(attData, options = {}) {
    const actor = this;
    if (!actor?.system || _patching.has(actor)) return original.call(this, attData, options);
    _patching.add(actor);

    const data = actor.system;
    const target = attData.roll?.target?.actor ?? null;
    const giant = isGiant(target);
    const type = options.type ?? "melee";

    const saved = {
      melee: data.thac0?.mod?.melee,
      missile: data.thac0?.mod?.missile,
      strMod: data.scores?.str?.mod,
      bba: data.thac0?.bba,
      itemDamage: attData.item?.system?.damage,
    };

    try {
      const thac0Mod = data.thac0?.mod;
      const itemDamage = attData.item?.system?.damage;
      const intMod = data.scores?.int?.mod ?? 0;

      const attackBonus = (giant && hasFeature(actor, FEATURES.attackGiantFoes) ? 2 : 0)
        + (hasFeature(actor, FEATURES.preciseStrikes) ? intMod : 0);
      const damageBonus = (giant && hasFeature(actor, FEATURES.harmGiantFoes) ? 2 : 0)
        + (hasFeature(actor, FEATURES.preciseStrikes) ? intMod : 0);

      // Attack channel: thac0 tweaks (melee mod leaks into damage).
      if (attackBonus && thac0Mod) {
        if (type === "melee") thac0Mod.melee = (saved.melee ?? 0) + attackBonus;
        else thac0Mod.missile = (saved.missile ?? 0) + attackBonus;
      }

      // Damage channel: item damage formula. For melee, the attack bonus
      // already leaked into damage via thac0.mod.melee, so compensate it
      // so the net damage bonus is exactly `damageBonus`.
      if (typeof itemDamage === "string") {
        const leak = type === "melee" ? attackBonus : 0;
        const netDamage = damageBonus - leak;
        if (netDamage) {
          const sign = netDamage > 0 ? "+" : "";
          attData.item.system.damage = `${itemDamage}${sign}${netDamage}`;
        }
      }
      // Unarmed fallback for Precise Strikes (no item damage string):
      // str.mod rides both the melee attack and melee damage parts.
      else if (type === "melee" && damageBonus && data.scores) {
        data.scores.str.mod = (saved.strMod ?? 0) + damageBonus;
      }

      // Finesse: DEX instead of STR. rollAttack reads scores.str.mod for
      // both the melee attack part and the melee damage part, so swapping
      // it once covers the whole rule.
      if (type === "melee" && hasFinesse(actor) && data.scores) {
        data.scores.str.mod = data.scores.dex.mod ?? 0;
      }

      // Underfoot Defense (Halfling): creatures larger than human-sized
      // suffer -1 to hit the halfling in melee. The attacker is `this`;
      // the halfling is the target. Large attacker + underfoot target =>
      // -1 on the attack. Characters roll via thac0.mod.melee; monsters
      // roll type "attack" and only carry bba, so subtract there.
      if (target && hasFeature(target, FEATURES.underfootDefense)) {
        if (isGiant(actor) && thac0Mod) {
          if (type === "melee") thac0Mod.melee = (saved.melee ?? 0) - 1;
          else if (type === "attack") data.thac0.bba = (data.thac0.bba ?? 0) - 1;
        }
      }

      // Charge Fury (Barbarian): the player triggers the charge via the
      // Charge Fury macro, which sets flags.chargeActive. The NEXT melee
      // attack consumes the flag, gains +2 to hit and +2 plus Strength
      // bonus to damage, and posts the "charge finished" message. The
      // exhausted state (can't charge again until a kill) is represented
      // by chargeActive being unset; the updateActor hook re-arms it when
      // the barbarian reduces an enemy to 0 HP.
      //
      // OSE melee math does the rule for us: attackMods = [str.mod,
      // thac0.mod.melee] ride BOTH rollParts and dmgParts. So bumping
      // thac0.mod.melee +2 adds exactly +2 to the attack roll and +2 to
      // the damage roll, while str.mod is already in both. Net effect:
      // +2 attack / +2+STR damage, exactly the charge rule.
      if (type === "melee" && actor.getFlag(FLAG_ROOT, "chargeActive") !== undefined) {
        await actor.unsetFlag(FLAG_ROOT, "chargeActive");
        await actor.setFlag(FLAG_ROOT, "chargeSpent", true);
        if (thac0Mod) thac0Mod.melee = (thac0Mod.melee ?? 0) + 2;
        // Post the charge-finished announcement.
        const card = document.createElement("div");
        card.className = "ose chat-card";
        const block = document.createElement("div");
        block.className = "ose chat-block";
        const content = document.createElement("div");
        content.className = "card-content";
        const p = document.createElement("p");
        p.append(actor.name, " finishes their charge. The barbarian is spent and cannot charge again until they reduce an enemy to 0 HP.");
        content.append(p);
        block.append(content);
        card.append(block);
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          flavor: "⚡ Charge Fury",
          content: card.outerHTML,
        });
      }

      // Cleanse Evil (Paladin, Dedication to Law & Good): the GM tags a
      // creature as Evil via the Cleanse Evil tag macro (which sets
      // flags.evil on the target actor). The Paladin's NORMAL attack then
      // reads the tag and applies the cleanse bonuses - no Paladin macro
      // needed. This supplies the "inherently evil creature" state that
      // OSE's data model does not carry (monsters have no alignment).
      //
      // Rule: +1 attack vs evil creatures with HD >= the paladin's level;
      // +2 damage vs evil creatures with HD < the paladin's level.
      // (Dedication to Law & Good; Smite Evil rides the same tag.)
      if (target && target.getFlag?.(FLAG_ROOT, "evil") && hasFeature(actor, FEATURES.dedicationLawGood)) {
        const attackerHd = actor.system?.details?.level ?? actor.system?.hp?.hd ?? 0;
        const targetHd = target.system?.hp?.hd ?? target.system?.details?.level ?? 0;
        // HD is a dice string ("2d6") for monsters; parse the die count.
        const hdOf = (v) => (typeof v === "number" ? v : Number.parseInt(String(v), 10) || 0);
        const cleanseDamage = hdOf(attackerHd) > hdOf(targetHd);
        if (cleanseDamage && typeof itemDamage === "string") {
          attData.item.system.damage = `${itemDamage}+2`;
        } else if (!cleanseDamage && thac0Mod) {
          if (type === "melee") thac0Mod.melee = (saved.melee ?? 0) + 1;
          else if (type === "attack") data.thac0.bba = (data.thac0.bba ?? 0) + 1;
          else thac0Mod.missile = (saved.missile ?? 0) + 1;
        }
      }

      // Enemy Slayer (Ranger): the ranger marks a common enemy as unaware
      // via the Enemy Slayer macro (sets flags.unaware). The assassination
      // gains +4 to attack and double damage against the unaware enemy.
      // The mark is consumed by the next attack against that target, so
      // the ranger must choose the moment.
      if (target && target.getFlag?.(FLAG_ROOT, "unaware") && hasFeature(actor, FEATURES.enemySlayer)) {
        await target.unsetFlag(FLAG_ROOT, "unaware");
        if (thac0Mod) {
          if (type === "melee") thac0Mod.melee = (saved.melee ?? 0) + 4;
          else if (type === "attack") data.thac0.bba = (data.thac0.bba ?? 0) + 4;
          else thac0Mod.missile = (saved.missile ?? 0) + 4;
        }
        // Double damage: append a "*2" to the item damage formula. The
        // whole melee damage part (str.mod rides along) is doubled, which
        // is the intended "dealing double damage" of the assassination.
        if (typeof itemDamage === "string") {
          attData.item.system.damage = `(${itemDamage})*2`;
        }
        const card = document.createElement("div");
        card.className = "ose chat-card";
        const block = document.createElement("div");
        block.className = "ose chat-block";
        const content = document.createElement("div");
        content.className = "card-content";
        const p = document.createElement("p");
        p.append(actor.name, " strikes a vulnerable enemy: +4 to hit and double damage (Enemy Slayer).");
        content.append(p);
        block.append(content);
        card.append(block);
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          flavor: "🎯 Enemy Slayer",
          content: card.outerHTML,
        });
      }

      // Dark Assassination (Drow): in pitch darkness vs an unaware or
      // blinded creature, the drow chooses +4 to attack OR double damage
      // on a successful hit. The macro sets the unaware flag plus an
      // assassinateDouble choice flag; this wrapper consumes both.
      // DarkAssassination and EnemySlayer both key off flags.unaware, so
      // only one can fire per attack (the flag is consumed).
      if (target && target.getFlag?.(FLAG_ROOT, "unaware") && hasFeature(actor, FEATURES.darkAssassination)) {
        const darknessOn =
          canvas.scene?.getFlag(FLAG_ROOT, "darkness") ??
          actor.getFlag(FLAG_ROOT, "darkness") ??
          target.getFlag(FLAG_ROOT, "blinded");
        if (darknessOn) {
          await target.unsetFlag(FLAG_ROOT, "unaware");
          const double = target.getFlag(FLAG_ROOT, "assassinateDouble");
          await target.unsetFlag(FLAG_ROOT, "assassinateDouble");
          if (double && typeof itemDamage === "string") {
            attData.item.system.damage = `(${itemDamage})*2`;
          } else if (!double && thac0Mod) {
            if (type === "melee") thac0Mod.melee = (saved.melee ?? 0) + 4;
            else if (type === "attack") data.thac0.bba = (data.thac0.bba ?? 0) + 4;
            else thac0Mod.missile = (saved.missile ?? 0) + 4;
          }
          const card = document.createElement("div");
          card.className = "ose chat-card";
          const block = document.createElement("div");
          block.className = "ose chat-block";
          const content = document.createElement("div");
          content.className = "card-content";
          const p = document.createElement("p");
          p.append(
            actor.name,
            double
              ? " strikes from darkness for double damage (Dark Assassination)."
              : " strikes from darkness with +4 to hit (Dark Assassination).",
          );
          content.append(p);
          block.append(content);
          card.append(block);
          await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor }),
            flavor: "🌑 Dark Assassination",
            content: card.outerHTML,
          });
        }
      }

      // Smite Evil (Paladin): the GM tags a creature as Evil via the
      // Cleanse Evil macro. When the paladin rolls a natural 20 (19 at
      // 9th, 18 at 14th) against a tagged creature, the attack deals
      // maximum damage plus an extra damage roll. The natural d20 is
      // read from the resolved Roll's first term after the system roll.
      const roll = await original.call(this, attData, options);
      const natural = roll?.terms?.[0]?.results?.[0]?.result;
      if (natural && hasFeature(actor, FEATURES.smiteEvil) && target?.getFlag?.(FLAG_ROOT, "evil")) {
        const level = getLevel(actor);
        const threshold = level >= 14 ? 18 : level >= 9 ? 19 : 20;
        if (natural >= threshold) {
          const dmgFormula = attData.item?.system?.damage;
          const maxBase = maxOfFormula(dmgFormula);
          const strMod = data.scores?.str?.mod ?? 0;
          const maxDmg = maxBase + (type === "melee" ? strMod : 0);
          const card = document.createElement("div");
          card.className = "ose chat-card";
          const block = document.createElement("div");
          block.className = "ose chat-block";
          const content = document.createElement("div");
          content.className = "card-content";
          const p = document.createElement("p");
          p.append(
            actor.name,
            ` smites with a natural ${natural}! The attack deals maximum damage (${maxDmg}) plus an extra damage roll.`,
          );
          content.append(p);
          block.append(content);
          card.append(block);
          const buttons = document.createElement("div");
          buttons.className = "rf-card-buttons";
          const extra = document.createElement("button");
          extra.type = "button";
          extra.className = "rf-btn";
          extra.innerHTML = '<span class="rf-btn-emoji">⚔️</span> Roll extra damage';
          extra.addEventListener("click", async () => {
            extra.disabled = true;
            const extraRoll = new Roll(dmgFormula ?? "1d6");
            await extraRoll.evaluate({ async: true });
            await extraRoll.toMessage({
              speaker: ChatMessage.getSpeaker({ actor }),
              flavor: "⚔️ Smite Evil - extra damage",
            });
            extra.disabled = false;
          });
          buttons.append(extra);
          card.append(buttons);
          await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor }),
            flavor: "⚔️ Smite Evil",
            content: card.outerHTML,
          });
        }
      }

      // Battle Songs (Bard): if a Bard with an active Play Instrument
      // effect is on the field, enemies who can hear it suffer -2 to
      // attack rolls unless they target the Bard. The Bard macro sets
      // flag battleSongMode = "play" on the Bard actor. We scan combatants
      // for any Bard with that flag; if found and this actor is not
      // targeting that Bard, apply -2.
      if (game.combat && target) {
        for (const combatant of game.combat.combatants) {
          const bardActor = combatant.actor;
          if (!bardActor) continue;
          const mode = bardActor.getFlag(FLAG_ROOT, "battleSongMode");
          if (mode === "play" && bardActor.uuid !== target.uuid) {
            if (thac0Mod) {
              if (type === "melee") thac0Mod.melee = (thac0Mod.melee ?? saved.melee ?? 0) - 2;
              else thac0Mod.missile = (thac0Mod.missile ?? saved.missile ?? 0) - 2;
            }
            break; // only one Bard penalty applies
          }
        }
      }

      // Keen Observation (Sage): the Sage studies a target (macro), and on
      // success sets a flag on the TARGET actor granting allies +attack /
      // +damage. The flag carries the bonus values and the Sage's uuid so
      // the bonus applies only to allies (not the Sage). The macro also
      // places a timed Active Effect for the duration.
      if (target) {
        const studyFlag = target.getFlag(FLAG_ROOT, "keenObserved");
        if (studyFlag && studyFlag.sageUuid !== actor.uuid) {
          const atkBonus = studyFlag.attackBonus ?? 0;
          const dmgBonus = studyFlag.damageBonus ?? 0;
          if (atkBonus && thac0Mod) {
            if (type === "melee") thac0Mod.melee = (thac0Mod.melee ?? saved.melee ?? 0) + atkBonus;
            else thac0Mod.missile = (thac0Mod.missile ?? saved.missile ?? 0) + atkBonus;
          }
          if (dmgBonus && typeof itemDamage === "string") {
            const sign = dmgBonus > 0 ? "+" : "";
            attData.item.system.damage = `${itemDamage}${sign}${dmgBonus}`;
          }
        }
      }

      return roll;
    } finally {
      if (data.thac0?.mod) {
        data.thac0.mod.melee = saved.melee;
        data.thac0.mod.missile = saved.missile;
      }
      if (data.thac0) data.thac0.bba = saved.bba;
      if (data.scores) data.scores.str.mod = saved.strMod;
      if (attData.item?.system) attData.item.system.damage = saved.itemDamage;
      _patching.delete(actor);
    }
  };
}

/* ---------------------------------------------------------------- */
/*  applyDamage wrapper: Barbarian damage reduction                  */
/* ---------------------------------------------------------------- */

/**
 * Wrap OseActor#applyDamage. Reduces damage by the Barbarian DR (1, or 2
 * at 9th level) when the actor has the feature. Damage cannot go below 1
 * per the house rule ("The damage taken cannot be reduced below 1").
 * @param {Function} original
 */
export function patchApplyDamage(original) {
  return async function applyDamage(amount = 0, multiplier = 1) {
    const actor = this;
    const damage = Math.floor(Number(amount) * (multiplier ?? 1));

    // Blink Away (Gnome): once per day, when the gnome takes damage from
    // an enemy, they may become invisible until the start of their next
    // turn or until they take damage again. The status icon is the
    // visible state; a flag tracks the daily use and the active blink.
    if (damage > 0 && hasFeature(actor, FEATURES.blinkAway)) {
      if (actor.getFlag(FLAG_ROOT, "blinkActive")) {
        // Blinked, then damaged again: the blink breaks early.
        await actor.unsetFlag(FLAG_ROOT, "blinkActive");
        await actor.toggleStatusEffect("invisible", { active: false });
      } else if (!isUsedToday(actor, "blinkAway")) {
        await markUsedToday(actor, "blinkAway");
        await actor.setFlag(FLAG_ROOT, "blinkActive", true);
        await actor.toggleStatusEffect("invisible", { active: true });
        const card = document.createElement("div");
        card.className = "ose chat-card";
        const block = document.createElement("div");
        block.className = "ose chat-block";
        const content = document.createElement("div");
        content.className = "card-content";
        const p = document.createElement("p");
        p.append(
          actor.name,
          " blinks away from the blow and fades from sight! (Blink Away - invisible until their next turn or until damaged again.)",
        );
        content.append(p);
        block.append(content);
        card.append(block);
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          flavor: "👻 Blink Away",
          content: card.outerHTML,
        });
      }
    }

    const hasDR = hasFeature(actor, FEATURES.damageReduction);
    if (!hasDR) return original.call(this, amount, multiplier);

    const level = Number(actor.system?.details?.level) || 1;
    const dr = level >= 9 ? 2 : 1;
    const reduced = Math.max(1, Math.floor(Number(amount) * multiplier) - dr);
    return original.call(this, reduced, 1);
  };
}

/**
 * Clear active Blink Away at the start of the gnome's next turn. Called
 * from the combatRound hook; the invisible status is dropped for any
 * actor whose blink is still active when their turn comes around.
 */
export function clearBlinkOnTurn() {
  for (const actor of game.actors ?? []) {
    if (actor.getFlag(FLAG_ROOT, "blinkActive")) {
      actor.unsetFlag(FLAG_ROOT, "blinkActive").catch(() => {});
      actor.toggleStatusEffect("invisible", { active: false }).catch(() => {});
    }
  }
}

/* ---------------------------------------------------------------- */
/*  rollCheck wrapper: Cleric Faith's Influence                      */
/* ---------------------------------------------------------------- */

/**
 * Wrap OseActor#rollCheck (WIS/CHA attribute checks). When the Cleric has
 * the Faith's Influence toggle active, the check target is raised by 1
 * (+2 vs same faith and alignment is handled by the GM via the toggle
 * state — the module applies the base +1 and the tooltip documents the
 * scaling). OSE checks are roll-under: roll 1d20 <= target.
 * @param {Function} original
 */
export function patchRollCheck(original) {
  return function rollCheck(score, options = {}) {
    const actor = this;
    if (!actor) return original.call(this, score, options);
    const active = actor.getFlag(FLAG_ROOT, "faithActive") === true;
    const isWisCha = score === "wis" || score === "cha";
    if (!active || !isWisCha) return original.call(this, score, options);

    const data = actor.system;
    const saved = data.scores?.[score]?.value;
    try {
      if (data.scores?.[score]) data.scores[score].value = (saved ?? 0) + 1;
      return original.call(this, score, options);
    } finally {
      if (data.scores?.[score]) data.scores[score].value = saved;
    }
  };
}
