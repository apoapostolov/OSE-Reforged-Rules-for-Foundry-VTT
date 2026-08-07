/**
 * 🛡️ BATTLE OATH (Knight)
 * =======================
 * HOW TO USE THIS MACRO
 * ---------------------
 * 1. Drag this macro to your hotbar.
 * 2. Select YOUR knight's token.
 * 3. Click the macro BEFORE you roll initiative for a round. The oath
 *    is declared and posted to the chat.
 *
 * WHAT THIS NEEDS
 * ---------------
 * - The "OSE Reforged Rules" module must be enabled (v1.2.0+).
 * - Your knight must have the Battle Oath ability on their sheet.
 * - Once per ENCOUNTER: after you use it, you cannot use it again until
 *   the current combat ends (the module resets it on encounter end).
 *
 * WHAT IT DOES
 * ------------
 * - Posts the oath announcement to the chat.
 * - Marks the knight as under oath. While the knight remains standing:
 *   - All hirelings get +2 to their Morale Checks (the module's morale
 *     rolls apply it).
 *   - Opponents of opposite alignment focus their attacks on the knight
 *     (the GM adjudicates who is opposite alignment and resolves the
 *     taunt; the module cannot read alignment of arbitrary monsters).
 *
 * WHAT YOU SEE
 * ------------
 * - "🛡️ <name> speaks a Battle Oath!" in the chat.
 * - A whisper to the GM listing the affected hirelings.
 *
 * TROUBLESHOOTING
 * ---------------
 * - "already sworn this encounter": wait for the encounter to end.
 * - The oath ends when the knight falls (0 hp or lower) or the combat
 *   ends.
 */
const FLAG_ROOT = "ose-apo-reforged-rules";

const token = canvas.tokens?.controlled?.[0] ?? null;
const actor = token?.actor ?? game.user.character;
if (!actor) {
  ui.notifications.warn("Select your token or set a character first.");
} else if (actor.getFlag(FLAG_ROOT, "battleOath")) {
  ui.notifications.warn(`${actor.name} has already sworn an oath this encounter.`);
} else {
  await actor.setFlag(FLAG_ROOT, "battleOath", true);

  const card = document.createElement("div");
  card.className = "ose chat-card";
  const block = document.createElement("div");
  block.className = "ose chat-block";
  const content = document.createElement("div");
  content.className = "card-content";
  const p = document.createElement("p");
  p.append(
    actor.name,
    " speaks a passionate oath of the moment! Until the knight falls, hirelings gain +2 to Morale Checks and opponents of opposite alignment are taunted to focus their attacks on the knight.",
  );
  content.append(p);
  block.append(content);
  card.append(block);

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: "🛡️ Battle Oath",
    content: card.outerHTML,
  });

  // Whisper the hireling morale boost to the GM.
  const hirelings = game.actors
    ?.filter((a) => a.type === "character" && a.getFlag(FLAG_ROOT, "hireling"))
    ?.map((a) => a.name);
  if (hirelings?.length) {
    await ChatMessage.create({
      whisper: ChatMessage.getWhisperRecipients("GM"),
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: "🛡️ Battle Oath - hirelings",
      content: `<p>Hirelings gain +2 to Morale Checks while ${actor.name} stands: ${hirelings.join(", ")}.</p>`,
    });
  }
}
