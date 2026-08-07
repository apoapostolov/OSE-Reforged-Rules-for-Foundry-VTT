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
import { hasFeature, hasFinesse } from "./helpers.js";

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
  return function rollAttack(attData, options = {}) {
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

      return original.call(this, attData, options);
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
    const hasDR = hasFeature(actor, FEATURES.damageReduction);
    if (!hasDR) return original.call(this, amount, multiplier);

    const level = Number(actor.system?.details?.level) || 1;
    const dr = level >= 9 ? 2 : 1;
    const reduced = Math.max(1, Math.floor(Number(amount) * multiplier) - dr);
    return original.call(this, reduced, 1);
  };
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
