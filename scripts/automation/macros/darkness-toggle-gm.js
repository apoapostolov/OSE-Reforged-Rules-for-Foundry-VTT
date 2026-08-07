/**
 * 🌑 DARKNESS TOGGLE (GM tool)
 * ============================
 * HOW TO USE THIS MACRO
 * ---------------------
 * 1. Drag this macro to your hotbar. Only the GM can run it.
 * 2. Click it once: the scene is flagged as pitch darkness.
 * 3. Click again: darkness is cleared.
 *
 * WHAT IT DOES
 * ------------
 * Sets or clears `flags.ose-apo-reforged-rules.darkness` on the active
 * scene. Features that key off darkness read this flag: the Drow's Dark
 * Assassination (+4 or double damage in darkness), the Drow's Dark
 * Vision nuance, and any other house rule that needs to know the scene
 * is dark without relying on Foundry's own scene-darkness slider (which
 * affects rendering, not rules).
 *
 * WHY A FLAG AND NOT THE SCENE'S DARKNESS SETTING
 * -----------------------------------------------
 * Foundry's scene darkness is a rendering value (0-1 light level). The
 * module needs a rules-level "it is dark here" truth that players cannot
 * change and that survives scene switches. The flag is that truth.
 * Players never see it; the module's attack wrappers read it.
 *
 * TROUBLESHOOTING
 * ---------------
 * - "Only the GM can": this is a GM tool by design.
 * - The flag is per-scene. If you switch scenes, toggle it again.
 */
const FLAG_ROOT = "ose-apo-reforged-rules";

if (!game.user.isGM) {
  ui.notifications.warn("Only the GM can toggle the darkness flag.");
} else {
  const scene = canvas.scene;
  if (!scene) {
    ui.notifications.warn("No active scene.");
  } else {
    const current = scene.getFlag(FLAG_ROOT, "darkness") ?? false;
    const next = !current;
    await scene.setFlag(FLAG_ROOT, "darkness", next);
    await ChatMessage.create({
      whisper: ChatMessage.getWhisperRecipients("GM"),
      speaker: ChatMessage.getSpeaker({ actor: game.user.character ?? undefined }),
      flavor: "🌑 Darkness",
      content: `<p>${next ? "Pitch darkness falls on this scene." : "The darkness lifts."}</p>`,
    });
  }
}
