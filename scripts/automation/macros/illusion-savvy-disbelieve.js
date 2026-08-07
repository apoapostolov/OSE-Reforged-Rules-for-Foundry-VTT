/**
 * 🌫️ ILLUSION SAVVY - Disbelieve (Illusionist)
 * ============================================
 * HOW TO USE THIS MACRO
 * ---------------------
 * 1. Drag this macro to your hotbar.
 * 2. Select YOUR illusionist's token.
 * 3. Click the macro while an illusion is in view. The module rolls a
 *    simple Wisdom check for the illusionist.
 *
 * WHAT THIS NEEDS
 * ---------------
 * - The "OSE Reforged Rules" module must be enabled (v1.2.0+).
 * - Your illusionist must have the Illusion Savvy ability on their
 *   sheet.
 *
 * WHAT IT DOES
 * ------------
 * The Illusionist does not need to touch an illusion: if they can see
 * it, they can attempt a simple Wisdom check (roll under WIS) to
 * disbelieve it for themselves. Others remain subject to believe in it.
 *
 * WHAT YOU SEE
 * ------------
 * - The Wisdom check roll in the chat. The GM (or you) decides the
 *   outcome: success disbelieves the illusion for your character only.
 *
 * TROUBLESHOOTING
 * ---------------
 * - "No token": select your token first.
 * - The roll is a plain WIS check; the GM applies the result to the
 *   illusion's DC or judgment.
 */
const token = canvas.tokens?.controlled?.[0] ?? null;
const actor = token?.actor ?? game.user.character;
if (!actor) {
  ui.notifications.warn("Select your token or set a character first.");
} else if (!actor.items?.some((i) => i.name === "Illusion Savvy")) {
  ui.notifications.warn("Your character does not have the Illusion Savvy ability.");
} else {
  await actor.rollCheck("wis", { fastForward: true });
}
