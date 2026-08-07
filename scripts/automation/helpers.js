/**
 * Shared helpers for the Reforged automation layer.
 * Feature detection scans the actor's items for the Reforged ability names,
 * so any actor who has the compendium item on their sheet gets the feature.
 */
import { FLAG_ROOT, FINESSE_FEATURES, REROLL_SAVE_MAP } from "./constants.js";

/* ---------------------------------------------------------------- */
/*  Feature detection                                                */
/* ---------------------------------------------------------------- */

/**
 * Return true if the actor has an ability item with the given exact name.
 * @param {Actor} actor
 * @param {string} featureName
 * @returns {boolean}
 */
export function hasFeature(actor, featureName) {
  if (!actor?.items?.size) return false;
  return actor.items.some((i) => i.type === "ability" && i.name === featureName);
}

/**
 * Return true if the actor has any of the finesse features.
 * @param {Actor} actor
 * @returns {boolean}
 */
export function hasFinesse(actor) {
  return FINESSE_FEATURES.some((name) => hasFeature(actor, name));
}

/**
 * Find which reroll feature (if any) covers the given save category for an
 * actor. Returns the feature item, or null.
 * @param {Actor} actor
 * @param {string} saveKey  one of death/wand/paralysis/breath/spell
 * @returns {object|null}
 */
export function getRerollFeatureForSave(actor, saveKey) {
  for (const [featureName, saves] of Object.entries(REROLL_SAVE_MAP)) {
    if (saves.includes(saveKey) && hasFeature(actor, featureName)) {
      return actor.items.find((i) => i.type === "ability" && i.name === featureName);
    }
  }
  return null;
}

/**
 * Get the actor level (character sheets) or HD (monsters).
 * @param {Actor} actor
 * @returns {number}
 */
export function getLevel(actor) {
  const data = actor.system;
  if (actor.type === "monster") {
    const hd = Number.parseInt(data?.hp?.hd, 10);
    return Number.isFinite(hd) ? hd : 1;
  }
  return Number(data?.details?.level) || 1;
}

/**
 * Dodge die size by level: d4 -> d6 @5 -> d8 @9 -> d10 @13.
 * @param {number} level
 * @returns {string}
 */
export function dodgeDie(level) {
  if (level >= 13) return "d10";
  if (level >= 9) return "d8";
  if (level >= 5) return "d6";
  return "d4";
}

/**
 * Damage reduction value by level: 1, or 2 at 9th level and above.
 * @param {number} level
 * @returns {number}
 */
export function damageReduction(level) {
  return level >= 9 ? 2 : 1;
}

/* ---------------------------------------------------------------- */
/*  Button builder (emoji + label + hover tooltip)                   */
/* ---------------------------------------------------------------- */

/**
 * Build a chat-card button with an emoji/glyph before the label and a
 * hover tooltip explaining the rule. Uses OSE core .card-buttons button
 * styling plus a .rf-btn polish class.
 * @param {object} opts
 * @param {string} opts.emoji   glyph before the label
 * @param {string} opts.label   button text
 * @param {string} opts.tooltip rule text shown on hover
 * @param {string} opts.action  data-action value (module-namespaced)
 * @param {object} [opts.dataset] extra data-* attributes
 * @returns {HTMLButtonElement}
 */
export function makeButton({ emoji, label, tooltip, action, dataset = {} }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "rf-btn";
  btn.dataset.action = action;
  for (const [k, v] of Object.entries(dataset)) btn.dataset[k] = v;
  if (emoji) btn.innerHTML = `<span class="rf-btn-emoji">${emoji}</span> ${label}`;
  else btn.textContent = label;
  if (tooltip) btn.dataset.rfTooltip = tooltip;
  return btn;
}

/**
 * Append a rule-explanation tooltip element to a card. The tooltip is a
 * visible badge that explains the rule on hover; it renders as an inline
 * span with a styled hover bubble.
 * @param {HTMLElement} container
 * @param {object} opts
 * @param {string} opts.emoji
 * @param {string} opts.label
 * @param {string} opts.rule  full rule text for the hover bubble
 * @returns {HTMLElement}
 */
export function appendRuleTag(container, { emoji, label, rule }) {
  const tag = document.createElement("span");
  tag.className = "rf-rule-tag";
  tag.innerHTML = `<span class="rf-btn-emoji">${emoji}</span> ${label}`;
  tag.dataset.rfTooltip = rule;
  container.append(tag);
  return tag;
}

/* ---------------------------------------------------------------- */
/*  OSE card helpers                                                 */
/* ---------------------------------------------------------------- */

/**
 * Get the actor referenced by an OSE chat card via data-actor-id or the
 * synthetic token id.
 * @param {HTMLElement} card
 * @returns {Actor|null}
 */
export function cardActor(card) {
  const tokenKey = card.dataset.tokenId;
  if (tokenKey) {
    const [sceneId, tokenId] = tokenKey.split(".");
    const scene = game.scenes.get(sceneId);
    const token = scene?.getEmbeddedDocument("Token", tokenId);
    return token?.actor ?? null;
  }
  return game.actors.get(card.dataset.actorId) ?? null;
}

/**
 * Append a button into a card's own actions container. The container class
 * is intentionally NOT `.card-buttons`: OSE's delegated chat listener routes
 * `.card-buttons button` clicks into OseItem._onChatCardAction, which has no
 * case for module actions. A separate class keeps our buttons native-looking
 * (.rf-btn) without being hijacked by the system handler.
 * @param {HTMLElement} card
 * @param {HTMLButtonElement} button
 * @returns {HTMLElement} the container
 */
export function appendCardButton(card, button) {
  let container = card.querySelector(".rf-card-buttons");
  if (!container) {
    container = document.createElement("div");
    container.className = "rf-card-buttons";
    card.append(container);
  }
  container.append(button);
  return container;
}

/**
 * Track a per-day (once per day) usage flag on an actor.
 * @param {Actor} actor
 * @param {string} key  usage key, e.g. "lucky" / "grimTenacity"
 * @returns {boolean} true if the feature was already used today
 */
export function isUsedToday(actor, key) {
  const today = game.time.worldTime;
  return actor.getFlag(FLAG_ROOT, `used.${key}`) === today;
}

export function markUsedToday(actor, key) {
  return actor.setFlag(FLAG_ROOT, `used.${key}`, game.time.worldTime);
}

/* ---------------------------------------------------------------- */
/*  Per-round usage tracking (combat-scoped, in-memory)              */
/* ---------------------------------------------------------------- */

const _roundUsage = new Map(); // actorId -> Set of keys used this round

function currentRound() {
  return game.combat?.round ?? 0;
}

/**
 * True if the key was already used this combat round.
 * @param {Actor} actor
 * @param {string} key
 * @returns {boolean}
 */
export function isUsedThisRound(actor, key) {
  const entry = _roundUsage.get(actor.id);
  if (!entry || entry.round !== currentRound()) return false;
  return entry.keys.has(key);
}

/**
 * Mark a key as used this combat round.
 * @param {Actor} actor
 * @param {string} key
 */
export function markUsedThisRound(actor, key) {
  const round = currentRound();
  const entry = _roundUsage.get(actor.id);
  if (!entry || entry.round !== round) {
    _roundUsage.set(actor.id, { round, keys: new Set([key]) });
  } else {
    entry.keys.add(key);
  }
}

/**
 * Clear round usage when combat advances or ends. Register once from main.
 */
export function registerRoundUsageHooks() {
  for (const hook of ["combatRound", "combatStart", "combatEnd", "deleteCombat"]) {
    Hooks.on(hook, () => {
      _roundUsage.clear();
    });
  }
}
