/**
 * ⚡ CHARGE FURY (Barbarian)
 * =========================
 * HOW TO USE THIS MACRO
 * ---------------------
 * 1. Drag this macro to your hotbar (or open it from the Macro Directory).
 * 2. Select your barbarian's token on the map. (If your character is set
 *    in the player configuration, that works too.)
 * 3. Click the macro. A message announces the charge.
 * 4. Make your NEXT melee attack as you normally would. It automatically
 *    gains +2 to hit and +2 plus your Strength bonus to damage.
 * 5. After the attack, the charge is spent. You cannot charge again until
 *    you reduce an enemy to 0 HP - the module tells you when you can.
 *
 * WHAT THIS NEEDS
 * ---------------
 * - The "OSE Reforged Rules" module must be enabled (v1.2.0+).
 * - Your barbarian must have the Charge Fury ability on their sheet.
 * - Only the barbarian player should run it, but anyone can try (the
 *    macro refuses politely if the state is wrong).
 *
 * WHAT YOU SEE
 * ------------
 * - On click: "⚡ Charge Fury" announcement in the chat.
 * - After the next attack: "charge finished, spent until a kill".
 * - After dropping an enemy to 0 HP: "may charge again".
 * The exhausted state lives on your character, so it survives a reload.
 *
 * TROUBLESHOOTING
 * ---------------
 * - "is spent": you must drop an enemy to 0 HP before charging again.
 * - "already charging": the charge is armed; just make the attack.
 * - No token selected: select your token first.
 */
const FLAG_ROOT = "ose-apo-reforged-rules";

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
