/**
 * Actor hooks: Sleep/Paralysis immunity + Grim Tenacity.
 *
 * - The Drow, Elf, and Half-Elf have Immunity to Sleep and Paralysis
 *   (modified from the official Ghoul Paralysis immunity). OSE has no native
 *   condition/status system, so statuses arrive from core Foundry effects or
 *   modules. This hook intercepts status-effect application on the actor and
 *   suppresses the blocked statuses.
 * - The Half-Orc has Grim Tenacity: when reduced to 0 hp, save vs Death to
 *   remain conscious until the end of the next round or -10 hp. A chat card
 *   with a save button is posted the moment HP hits 0 (once per day).
 */
import { FEATURES, FLAG_ROOT } from "./constants.js";
import { getLevel, hasFeature, isUsedToday, makeButton, markUsedToday } from "./helpers.js";
import { _takeChargeHit } from "./chat-cards.js";

const BLOCKED_STATUSES = ["sleep", "paralysis", "paralyzed", "unconscious"];

/**
 * True when the actor has the sleep/paralysis immunity feature.
 * @param {Actor} actor
 */
function isImmune(actor) {
  return hasFeature(actor, FEATURES.sleepParalysisImmunity);
}

/**
 * Strip blocked statuses from a statuses diff.
 * @param {Set|string[]|undefined} statuses
 * @returns {string[]|null} cleaned statuses, or null when unchanged
 */
function stripBlocked(statuses) {
  if (!statuses) return null;
  const list = [...statuses];
  const cleaned = list.filter((s) => !BLOCKED_STATUSES.includes(String(s)));
  return cleaned.length === list.length ? null : cleaned;
}

/**
 * Hook preUpdateActor: block sleep/paralysis/unconscious statuses from
 * being applied to an immune actor. Modifies the differential data before
 * the update lands.
 * @param {Actor} actor
 * @param {object} changes
 */
function onPreUpdateActor(actor, changes) {
  if (!isImmune(actor)) return;

  // Core statuses live on the actor document as a Set (statuses field).
  const cleaned = stripBlocked(changes.statuses);
  if (cleaned !== null) {
    changes.statuses = cleaned.length ? cleaned : [];
    notifyImmunity(actor);
  }

  // Some modules push statuses through system.statuses.
  const systemCleaned = stripBlocked(changes["system.statuses"]);
  if (systemCleaned !== null) {
    changes["system.statuses"] = systemCleaned.length ? systemCleaned : [];
    notifyImmunity(actor);
  }
}

/**
 * Post a quiet chat notice that the status was blocked.
 * Built with DOM APIs so the actor name (user-controlled) cannot inject HTML.
 * @param {Actor} actor
 */
function notifyImmunity(actor) {
  const card = document.createElement("div");
  card.className = "ose chat-card rf-immunity-card";

  const block = document.createElement("div");
  block.className = "ose chat-block";

  const header = document.createElement("div");
  header.className = "chat-header flexrow";
  const title = document.createElement("div");
  title.className = "chat-title";
  const h2 = document.createElement("h2");
  h2.textContent = "💤 Immunity";
  title.append(h2);
  header.append(title);
  block.append(header);

  const content = document.createElement("div");
  content.className = "card-content";
  const p1 = document.createElement("p");
  p1.append(actor.name, " is ");
  const b = document.createElement("b");
  b.textContent = "immune to Sleep and Paralysis";
  p1.append(b, " — the status was not applied.");
  const p2 = document.createElement("p");
  p2.className = "rf-tooltip-text";
  p2.textContent =
    "Spells or creature attacks cannot put them to sleep or paralyze them. " +
    "They can still be petrified by creatures such as Basilisks or Medusas.";
  content.append(p1, p2);
  block.append(content);
  card.append(block);

  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: card.outerHTML,
  });
}

/**
 * Watch HP updates: when a half-orc with Grim Tenacity drops to 0 hp, post a
 * chat card with a save-vs-Death button (once per day). The GM or player
 * clicks it to roll; on success the half-orc stays conscious per the rule.
 * Also: when a barbarian's recorded charge target drops to 0 HP, reset the
 * spent flag (Charge Fury re-arms after a kill) and announce it.
 * @param {Actor} actor
 * @param {object} changes
 * @param {object} options
 * @param {string} userId
 */
async function onUpdateActor(actor, changes) {
  const hp = actor.system?.hp;
  if (!hp) return;

  // Charge Fury kill attribution: if this actor was last hit by a
  // charge-capable barbarian and just dropped to 0 HP, that barbarian may
  // charge again.
  if (hp.value === 0) {
    const hit = _takeChargeHit(actor.uuid);
    if (hit) {
      const barbarian = game.actors.get(hit.barbarianId);
      if (barbarian?.getFlag(FLAG_ROOT, "chargeSpent")) {
        await barbarian.unsetFlag(FLAG_ROOT, "chargeSpent");
        const card = document.createElement("div");
        card.className = "ose chat-card";
        const block = document.createElement("div");
        block.className = "ose chat-block";
        const content = document.createElement("div");
        content.className = "card-content";
        const p = document.createElement("p");
        p.append(barbarian.name, " reduced ", actor.name, " to 0 HP and may charge again!");
        content.append(p);
        block.append(content);
        card.append(block);
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: barbarian }),
          flavor: "⚡ Charge Fury",
          content: card.outerHTML,
        });
      }
    }
  }

  // Battle Oath (Knight): while the knight stands, hirelings get +2
  // morale and opponents of opposite alignment focus on the knight. If
  // the knight drops to 0 hp or lower, the oath ends.
  if (hp.value <= 0 && actor.getFlag(FLAG_ROOT, "battleOath")) {
    await actor.unsetFlag(FLAG_ROOT, "battleOath");
    const card = document.createElement("div");
    card.className = "ose chat-card";
    const block = document.createElement("div");
    block.className = "ose chat-block";
    const content = document.createElement("div");
    content.className = "card-content";
    const p = document.createElement("p");
    p.textContent = `${actor.name} has fallen. The Battle Oath is broken; hirelings lose the +2 morale bonus.`;
    content.append(p);
    block.append(content);
    card.append(block);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: "🛡️ Battle Oath",
      content: card.outerHTML,
    });
  }

  // Stubborn Vitality: half-orc's CON loss when reaching 0 hp or lower is
  // reduced by 1 (by 2 at 5th level, by 3 at 9th). The base CON loss is
  // the table's standard (applied by the GM); this card states the reduced
  // amount so the GM applies it instead.
  if (hp.value <= 0 && hasFeature(actor, FEATURES.stubbornVitality)) {
    const level = getLevel(actor);
    const reduction = level >= 9 ? 3 : level >= 5 ? 2 : 1;
    const card = document.createElement("div");
    card.className = "ose chat-card";
    const block = document.createElement("div");
    block.className = "ose chat-block";
    const content = document.createElement("div");
    content.className = "card-content";
    const p = document.createElement("p");
    p.textContent =
      `${actor.name} is at 0 hp or lower. Stubborn Vitality: the usual ` +
      `Constitution loss is reduced by ${reduction} (level ${level}).`;
    content.append(p);
    block.append(content);
    card.append(block);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: "💪 Stubborn Vitality",
      content: card.outerHTML,
    });
  }

  // Grim Tenacity: half-orc dropped to 0 hp.
  if (hp.value !== 0) return;
  if (!hasFeature(actor, FEATURES.grimTenacity)) return;
  if (isUsedToday(actor, "grimTenacity")) return;
  // Build a card with the save button. DOM-built so actor name cannot
  // inject HTML.
  const card = document.createElement("div");
  card.className = "ose chat-card rf-grim-card";
  const block = document.createElement("div");
  block.className = "ose chat-block";

  const header = document.createElement("div");
  header.className = "chat-header flexrow";
  const title = document.createElement("div");
  title.className = "chat-title";
  const h2 = document.createElement("h2");
  h2.textContent = "💀 Grim Tenacity";
  title.append(h2);
  header.append(title);
  block.append(header);

  const content = document.createElement("div");
  content.className = "card-content";
  const p = document.createElement("p");
  p.textContent =
    `${actor.name} is reduced to 0 hp. Grim Tenacity: save vs Death to remain ` +
    "conscious until the end of the next round or until reduced to -10 hp. " +
    "On failure, they drop and begin dying normally. Once per day.";
  content.append(p);
  block.append(content);

  const buttons = document.createElement("div");
  buttons.className = "rf-card-buttons";
  const btn = makeButton({
    emoji: "💀",
    label: "Grim Tenacity (Save vs Death)",
    tooltip:
      "Grim Tenacity: when reduced to 0 hp, save vs Death to remain conscious. " +
      "On success you may act until the end of the next round or until reduced " +
      "to -10 hp. On failure you drop and begin dying normally. Once per day.",
    action: "rf-grim-tenacity",
    dataset: { actorId: actor.id },
  });
  btn.addEventListener("click", async (event) => {
    event.preventDefault();
    btn.disabled = true;
    await markUsedToday(actor, "grimTenacity");
    await actor.rollSave("death", { fastForward: true });
    btn.disabled = false;
  });
  buttons.append(btn);
  block.append(buttons);
  card.append(block);

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: card.outerHTML,
  });
}

export function registerActorHooks() {
  Hooks.on("preUpdateActor", onPreUpdateActor);
  Hooks.on("updateActor", onUpdateActor);
}
