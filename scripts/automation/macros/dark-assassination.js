/**
 * 🌑 DARK ASSASSINATION (Drow)
 * ============================
 * HOW TO USE THIS MACRO
 * ---------------------
 * 1. Drag this macro to your hotbar.
 * 2. Ensure your drow is in PITCH DARKNESS (the GM sets the scene's
 *    darkness, or you toggle it via the module's Darkness macro).
 * 3. Select YOUR drow's token and TARGET the enemy (press T on it).
 * 4. Click the macro. A dialog asks: take +4 to hit, or forfeit the
 *    bonus for DOUBLE damage on a successful hit?
 * 5. Make your attack as normal. The module applies what you chose.
 *
 * WHAT THIS NEEDS
 * ---------------
 * - The "OSE Reforged Rules" module must be enabled (v1.2.0+).
 * - Your drow must have the Dark Assassination ability on their sheet.
 * - An enemy must be TARGETED.
 * - Darkness must be active. The macro checks a scene/actor flag set by
 *   the GM's Darkness toggle macro; if the scene is dark via Foundry's
 *   own scene darkness setting, tell the GM to use the module's flag so
 *   the bonus applies.
 *
 * WHAT YOU SEE
 * ------------
 * - A dialog with the two options.
 * - A whisper to the GM: "Dark Assassination chosen: +4 to hit" or
 *   "... double damage on hit".
 * - Your next attack card shows the bonus.
 *
 * TROUBLESHOOTING
 * ---------------
 * - "Not in darkness": the module's darkness flag must be set (the GM
 *   runs the Darkness macro, or sets flags on the scene).
 * - "No target": press T on the enemy token first.
 */
const FLAG_ROOT = "ose-apo-reforged-rules";

const token = canvas.tokens?.controlled?.[0] ?? null;
const actor = token?.actor ?? game.user.character;
const targets = [...(game.user.targets ?? [])];
if (!actor) {
  ui.notifications.warn("Select your token or set a character first.");
} else if (!targets.length) {
  ui.notifications.warn("Target an enemy first (press T on its token), then run the macro.");
} else if (!(canvas.scene?.getFlag(FLAG_ROOT, "darkness") ?? actor.getFlag(FLAG_ROOT, "darkness"))) {
  ui.notifications.warn("Dark Assassination needs pitch darkness. Ask the GM to toggle the darkness flag.");
} else {
  const choice = await foundry.applications.api.DialogV2.prompt({
    title: "🌑 Dark Assassination",
    content: "<p>In pitch darkness against an unaware or blinded enemy, choose your strike:</p>",
    buttons: [
      { action: "bonus", label: "⚔️ +4 to attack", default: true },
      { action: "double", label: "💥 Double damage on hit" },
    ],
  });
  if (choice) {
    for (const t of targets) {
      const ta = t.actor ?? t.document?.actor;
      if (!ta) continue;
      await ta.setFlag(FLAG_ROOT, "unaware", true);
      await ta.setFlag(FLAG_ROOT, "assassinateDouble", choice === "double");
    }
    const content = targets
      .map(
        (t) =>
          `<p>🌑 ${t.name}: ${choice === "double" ? "double damage on hit" : "+4 to attack"} (Dark Assassination).</p>`,
      )
      .join("");
    await ChatMessage.create({
      whisper: ChatMessage.getWhisperRecipients("GM"),
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: "🌑 Dark Assassination",
      content,
    });
  }
}
