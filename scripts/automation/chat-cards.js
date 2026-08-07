/**
 * Chat-card option buttons for Tier 1 features.
 * Hooks renderChatMessageHTML to add buttons with emoji + hover tooltips.
 *
 * IMPORTANT: Roll#toJSON does not serialize the `data` field, so card state
 * must be read from the rendered DOM (data-actor-id, .chat-target uuid,
 * .damage-roll presence) rather than message.rolls[0].data.
 */
import { FEATURES } from "./constants.js";
import {
  appendCardButton,
  appendRuleTag,
  cardActor,
  dodgeDie,
  getLevel,
  getRerollFeatureForSave,
  hasFeature,
  isUsedThisRound,
  isUsedToday,
  makeButton,
  markUsedThisRound,
  markUsedToday,
} from "./helpers.js";
const RULES = {
  cleave:
    "Cleave: on your turn, when you reduce an enemy to 0 hp with a melee attack, " +
    "make one additional melee attack against another opponent you are engaged " +
    "with. Twice at 5th level, three times at 9th, four times at 13th. At 9th, " +
    "one cleave may instead move you up to 10 ft to engage a new enemy.",
  dodgeDie:
    "Dodge Die: once per round, when about to take damage from a successful attack, " +
    "roll the dodge die and add it to your AC for that attack. If the AC beats the " +
    "attack roll, the attack still hits for 1 hp and no other effects. The die grows: " +
    "d4 to d6 at 5th, d8 at 9th, d10 at 13th. No benefit while prone, grappled, or slowed.",
  rerollLucky:
    "Lucky: once per day, reroll a failed saving throw (or a d6 Hide check).",
  rerollStout:
    "Stout Fortune: once per day, reroll a failed save versus Death or Poison, " +
    "Paralysis or Petrification, or Spells (not Rods and Staves).",
  rerollIron:
    "Iron Will: once per day, reroll a failed save versus Poison or Spells.",
  rerollEvasion:
    "Acrobat Evasion: once per day, reroll a failed save versus Breath or Spells, " +
    "Wands and Staves.",
};

/* Per-feature button emoji + label */
const REROLL_UI = {
  [FEATURES.lucky]: { emoji: "🍀", label: "Lucky Reroll", rule: RULES.rerollLucky },
  [FEATURES.stoutFortune]: { emoji: "⛰️", label: "Stout Fortune Reroll", rule: RULES.rerollStout },
  [FEATURES.ironWill]: { emoji: "🛡️", label: "Iron Will Reroll", rule: RULES.rerollIron },
  [FEATURES.acrobatEvasion]: { emoji: "💨", label: "Acrobat Evasion", rule: RULES.rerollEvasion },
};

/* ---------------------------------------------------------------- */
/*  Card type detection (DOM-based)                                  */
/* ---------------------------------------------------------------- */

/**
 * True if the message is an OSE attack card. Primary signal is the message
 * flag OSE sets on attack cards (flags.ose.roll === "attack"); the DOM
 * fallback catches cards whose flag was stripped.
 * @param {ChatMessage} message
 * @param {HTMLElement} card
 */
export function isAttackCard(message, card) {
  if (message?.flags?.ose?.roll === "attack") return true;
  return Boolean(card.querySelector(".chat-target")) && Boolean(card.querySelector(".ose.chat-block"));
}

/**
 * True if the card is an OSE save card: its title ends with "Save" and it
 * renders a .roll-result with a success/fail class.
 * @param {HTMLElement} card
 */
export function isSaveCard(card) {
  const title = card.querySelector(".chat-title h2")?.textContent ?? "";
  const result = card.querySelector(".roll-result");
  if (!/Save\s*$/.test(title.trim())) return false;
  return Boolean(result && (result.classList.contains("roll-success") || result.classList.contains("roll-fail")));
}

/**
 * Resolve the save category (death/wand/paralysis/breath/spell) from the
 * card title ("Death Poison Save" -> death). Reverse-maps the localized
 * long label against CONFIG.OSE.saves_long.
 * @param {HTMLElement} card
 * @returns {string|null}
 */
export function saveKeyFromCard(card) {
  const title = card.querySelector(".chat-title h2")?.textContent ?? "";
  const long = CONFIG.OSE.saves_long;
  for (const [key, i18nKey] of Object.entries(long)) {
    const localized = game.i18n.localize(i18nKey);
    if (title.includes(localized)) return key;
  }
  return null;
}

/**
 * The targeted victim actor of an attack card, resolved from the
 * .chat-target data-id (a document uuid that may point at a TokenDocument).
 * @param {HTMLElement} card
 * @returns {Actor|null}
 */
export function cardTarget(card) {
  const id = card.querySelector(".chat-target")?.dataset?.id;
  if (!id) return null;
  const doc = fromUuidSync(id);
  return doc?.actor ?? (doc?.documentName === "Actor" ? doc : null) ?? null;
}

/* ---------------------------------------------------------------- */
/*  Attack cards: Cleave                                             */
/* ---------------------------------------------------------------- */

/**
 * Record a melee hit by a charge-capable barbarian for kill attribution.
 * Called on every attack card; only barbarians with the Charge Fury
 * feature are recorded, and only when the card actually hit (has a
 * damage-roll block) and named a victim.
 * @param {HTMLElement} card
 */
function recordChargeHit(card) {
  const actor = cardActor(card);
  if (!actor || !hasFeature(actor, FEATURES.chargeFury)) return;
  if (!card.querySelector(".damage-roll")) return; // miss: no damage block
  const targetId = card.querySelector(".chat-target")?.dataset?.id;
  if (!targetId) return;
  _recordChargeHit(targetId, actor.id);
}

/**
 * Add the Cleave button to a successful melee attack card when the attacker
 * has the feature. Clicking rolls a new melee attack against the current
 * controlled targets. The GM clicks when the kill actually happens.
 * @param {ChatMessage} message
 * @param {HTMLElement} card
 */
function addCleaveButton(message, card) {
  const actor = cardActor(card);
  if (!actor || !hasFeature(actor, FEATURES.cleave)) return;

  // Only melee attacks can cleave. OSE flags the attack type on the card:
  // roll.attack roll data is dropped on serialization, so read the flag
  // OSE sets for missile attacks (flags.ose.roll === "attack" for both, so
  // fall back to the weapon item: missile-only weapons cannot cleave).
  const item = actor.items.get(card.dataset.itemId);
  if (item && item.type === "weapon" && item.system.missile && !item.system.melee) return;

  // The damage block only renders on successful hits.
  if (!card.querySelector(".damage-roll")) return;

  const button = makeButton({
    emoji: "⚔️",
    label: "Cleave",
    tooltip: RULES.cleave,
    action: "rf-cleave",
    dataset: { actorId: actor.id },
  });
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    button.disabled = true;
    await actor.targetAttack({ roll: {} }, "melee", { skipDialog: true });
    button.disabled = false;
  });
  appendCardButton(card, button);
}

/* ---------------------------------------------------------------- */
/*  Attack cards: Dodge Die (defender-side button)                   */
/* ---------------------------------------------------------------- */

/**
 * Add the Dodge Die button to an attack card when the DEFENDER is an
 * Acrobat with the feature. Clicking rolls the dodge die and reports the
 * AC shift; the GM applies the 1-hp outcome when the dodge beats the roll.
 * @param {HTMLElement} card
 */
function addDodgeDieButton(card) {
  const target = cardTarget(card);
  if (!target || !hasFeature(target, FEATURES.dodgeDie)) return;
  if (isUsedThisRound(target, "dodgeDie")) return;

  const level = getLevel(target);
  const die = dodgeDie(level);

  const button = makeButton({
    emoji: "🤸",
    label: `Dodge (${die})`,
    tooltip: RULES.dodgeDie,
    action: "rf-dodge-die",
    dataset: { actorId: target.id, die },
  });
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    button.disabled = true;
    const roll = await new Roll(`1${die}`).evaluate({ async: true });
    await markUsedThisRound(target, "dodgeDie");
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: target }),
      flavor: `${target.name} — Dodge Die (${die})`,
    });
    button.disabled = false;
  });
  appendCardButton(card, button);
}

/* ---------------------------------------------------------------- */
/*  Save cards: once-per-day rerolls                                 */
/* ---------------------------------------------------------------- */

/**
 * Add a reroll button to failed save cards when the actor has a reroll
 * feature that covers that save category.
 * @param {HTMLElement} card
 */
function addRerollButton(card) {
  const actor = cardActor(card);
  if (!actor) return;

  // Failed saves only.
  const result = card.querySelector(".roll-result");
  if (!result || !result.classList.contains("roll-fail")) return;

  const saveKey = saveKeyFromCard(card);
  if (!saveKey) return;

  const feature = getRerollFeatureForSave(actor, saveKey);
  if (!feature) return;
  if (isUsedToday(actor, `reroll.${feature.name}`)) return;

  const ui = REROLL_UI[feature.name];
  const button = makeButton({
    emoji: ui.emoji,
    label: ui.label,
    tooltip: ui.rule,
    action: "rf-reroll-save",
    dataset: { actorId: actor.id, save: saveKey },
  });
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    button.disabled = true;
    await markUsedToday(actor, `reroll.${feature.name}`);
    await actor.rollSave(saveKey, { fastForward: true });
    button.disabled = false;
  });
  appendCardButton(card, button);
}

/* ---------------------------------------------------------------- */
/*  Rule tags on attack cards (passive features)                     */
/* ---------------------------------------------------------------- */

// Kill attribution for Charge Fury: last hit by a charge-capable
// barbarian per victim uuid, so the updateActor hook can reset the spent
// flag when the victim drops to 0 HP. In-memory (per-session).
const _chargeHits = new Map(); // victimUuid -> { barbarianId, round }

export function _recordChargeHit(victimUuid, actorId) {
  _chargeHits.set(victimUuid, { barbarianId: actorId, round: game.combat?.round ?? 0 });
}

export function _takeChargeHit(victimUuid) {
  const hit = _chargeHits.get(victimUuid);
  _chargeHits.delete(victimUuid);
  return hit ?? null;
}

/**
 * Tag an attack card with the passive features that apply: giant-foe
 * bonuses. These are informational; the numeric bonuses are applied by the
 * roll wrappers in roll-patches.js.
 * @param {HTMLElement} card
 */
function addRuleTags(card) {
  const actor = cardActor(card);
  if (!actor) return;
  const hasGiantAttack = hasFeature(actor, FEATURES.attackGiantFoes);
  const hasGiantDamage = hasFeature(actor, FEATURES.harmGiantFoes);
  if (!hasGiantAttack && !hasGiantDamage) return;

  // Attack cards have no .card-footer; create a tags row after the content.
  let footer = card.querySelector(".rf-tags");
  if (!footer) {
    footer = document.createElement("div");
    footer.className = "rf-tags";
    card.querySelector(".ose.chat-block")?.append(footer);
  }

  if (hasGiantAttack) {
    appendRuleTag(footer, {
      emoji: "🗿",
      label: "+2 vs Giants",
      rule:
        "Attack Giant Foes: against giant opponents (larger than human-sized), " +
        "you gain +2 to attack rolls. Applied automatically to attacks.",
    });
  }
  if (hasGiantDamage) {
    appendRuleTag(footer, {
      emoji: "💥",
      label: "+2 dmg vs Giants",
      rule:
        "Harm Giant Foes: against giant opponents (larger than human-sized), " +
        "you gain +2 to damage. Applied automatically to damage rolls.",
    });
  }
}

/* ---------------------------------------------------------------- */
/*  Registration                                                     */
/* ---------------------------------------------------------------- */

export function registerChatHooks() {
  Hooks.on("renderChatMessageHTML", (message, html) => {
    if (game.system.id !== "ose") return;
    const card = html.querySelector(".ose.chat-card");
    if (!card) return;

    if (isAttackCard(message, card)) {
      addCleaveButton(message, card);
      addDodgeDieButton(card);
      addRuleTags(card);
      recordChargeHit(card);
    } else if (isSaveCard(card)) {
      addRerollButton(card);
    }
  });
}
