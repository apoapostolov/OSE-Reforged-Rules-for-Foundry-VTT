/**
 * 🎯 ENEMY SLAYER - Mark Unaware (Ranger)
 * =======================================
 * HOW TO USE THIS MACRO
 * ---------------------
 * 1. Drag this macro to your hotbar.
 * 2. Select YOUR ranger's token and TARGET the enemy creature (press T
 *    while hovering it, or use the targeting tool).
 * 3. Click the macro. The enemy is marked "unaware" - the module posts
 *    a confirmation to the GM.
 * 4. Make your attack as normal. The module applies +4 to hit and
 *    DOUBLE damage for the assassination against the unaware enemy.
 *
 * WHAT THIS NEEDS
 * ---------------
 * - The "OSE Reforged Rules" module must be enabled (v1.2.0+).
 * - Your ranger must have the Enemy Slayer ability on their sheet.
 * - An enemy must be TARGETED (the targeting reticle), not just
 *   selected.
 *
 * WHAT YOU SEE
 * ------------
 * - A whisper to the GM: "Target marked unaware: <name>".
 * - Your next attack card shows the +4 / double damage bonus applied.
 *
 * TROUBLESHOOTING
 * ---------------
 * - "No target": press T on the enemy token first, or use the target
 *   tool in the token controls.
 * - The bonus is consumed by the NEXT attack against that enemy. If you
 *   attack a different target, the mark stays until the marked enemy is
 *   attacked or the scene changes.
 */
const FLAG_ROOT = "ose-apo-reforged-rules";

const token = canvas.tokens?.controlled?.[0] ?? null;
const actor = token?.actor ?? game.user.character;
const targets = [...(game.user.targets ?? [])];
if (!actor) {
  ui.notifications.warn("Select your token or set a character first.");
} else if (!targets.length) {
  ui.notifications.warn("Target an enemy first (press T on its token), then run the macro.");
} else {
  const names = [];
  for (const t of targets) {
    const ta = t.actor ?? t.document?.actor;
    if (!ta) continue;
    await ta.setFlag(FLAG_ROOT, "unaware", true);
    names.push(ta.name);
  }
  if (names.length) {
    const content = names
      .map((n) => `<p>🎯 ${n} marked as unaware (Enemy Slayer).</p>`)
      .join("");
    await ChatMessage.create({
      whisper: ChatMessage.getWhisperRecipients("GM"),
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: "🎯 Enemy Slayer",
      content,
    });
  }
}
