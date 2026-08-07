/**
 * Charge Fury macro (Barbarian) - player-facing trigger.
 *
 * This macro is the UI half of the Charge Fury automation. It sets the
 * charge state on the actor and posts the announcement. The module's
 * rollAttack wrapper (scripts/automation/roll-patches.js) consumes the
 * state on the NEXT melee attack, applies +2 attack / +2+STR damage, and
 * clears it with a "charge finished" message. The updateActor hook
 * (scripts/automation/actor-hooks.js) resets the state when the barbarian
 * reduces an enemy to 0 HP and posts "you can charge again".
 *
 * Install: create a script macro, paste this command, save, drag to the
 * hotbar. Requires the ose-apo-reforged-rules module (any version with
 * the Tier 1 runtime layer, v1.2.0+) to be active in the world.
 */
const FLAG_ROOT = "ose-apo-reforged-rules";

// Resolve the acting actor: controlled token first, then user character.
const token = canvas.tokens?.controlled?.[0] ?? null;
const actor = token?.actor ?? game.user.character;
if (!actor) {
  ui.notifications.warn("Select your token or set a character first.");
} else if (actor.getFlag(FLAG_ROOT, "chargeSpent")) {
  ui.notifications.warn(`${actor.name} is spent and cannot charge again until they reduce an enemy to 0 HP.`);
} else if (actor.getFlag(FLAG_ROOT, "chargeActive") !== undefined) {
  ui.notifications.warn(`${actor.name} is already charging. Make the attack.`);
} else {
  await actor.setFlag(FLAG_ROOT, "chargeActive", game.combat?.round ?? 0);

  // Build the announcement with DOM APIs so the actor name (user input)
  // cannot inject HTML into the chat card.
  const card = document.createElement("div");
  card.className = "ose chat-card";
  const block = document.createElement("div");
  block.className = "ose chat-block";
  const content = document.createElement("div");
  content.className = "card-content";
  const p = document.createElement("p");
  p.append(actor.name, " charges into battle! The next melee attack gains +2 to hit and +2 plus Strength bonus to damage.");
  content.append(p);
  block.append(content);
  card.append(block);

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor, token }),
    flavor: "⚡ Charge Fury",
    content: card.outerHTML,
  });
}
