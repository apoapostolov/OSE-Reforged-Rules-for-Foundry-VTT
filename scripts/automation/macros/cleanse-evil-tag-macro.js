/**
 * 🕯️ CLEANSE EVIL - Tag toggle (GM tool)
 * ======================================
 * HOW TO USE THIS MACRO
 * ---------------------
 * 1. Drag this macro to your hotbar. Only the GM can run it.
 * 2. Select one or more creature tokens on the map (a vampire, a demon,
 *    a cultist - anything the Paladin's powers should work against).
 * 3. Click the macro. The creature(s) are now marked as Evil.
 * 4. Click again to clear the mark.
 *
 * WHAT IT DOES
 * ------------
 * The mark is stored as HIDDEN metadata on the creature - players do not
 * see it. The Paladin's normal attack rolls (Dedication to Law & Good,
 * Smite Evil) read the mark automatically and apply their bonuses:
 *   - +1 to hit vs Evil creatures with HD equal to or greater than the
 *     paladin's level.
 *   - +2 damage vs Evil creatures with HD lower than the paladin's level.
 * The Paladin does NOT need a macro of their own - they just roll attacks
 * as always.
 *
 * SECRET TAGS
 * -----------
 * The macro whispers the result to the GM only. If the players should not
 * know that something is Evil yet, this stays secret. When you want the
 * mark visible to everyone (a blessed or cursed creature you want shown),
 * set USE_HIDDEN_FLAG = false below - it then uses a visible status icon
 * instead.
 *
 * TROUBLESHOOTING
 * ---------------
 * - "Only the GM can tag": this is a GM tool by design.
 * - "Select a token": select the creature token on the map first.
 * - Paladin bonuses not applying: the paladin needs the "Dedication to
 *   Law & Good" ability on their sheet, and the target must be tagged.
 */
const FLAG_ROOT = "ose-apo-reforged-rules";

// --- configuration -----------------------------------------------------
// true  = store the tag as hidden actor metadata (invisible to players).
// false = store as a visible status icon (players can see the mark).
const USE_HIDDEN_FLAG = true;
// When USE_HIDDEN_FLAG is true, also show a visible status icon as a
// reminder to the GM? false keeps it fully hidden.
const MIRROR_VISIBLE = false;
// Status icon id used in the visible mode (must exist in the world's
// status effects; add "evil" there if missing).
const EVIL_CONDITION = "evil";
// -----------------------------------------------------------------------

if (!game.user.isGM) {
  ui.notifications.warn("Only the GM can tag creatures as Evil.");
} else {
  const tokens = canvas.tokens?.controlled ?? [];
  if (!tokens.length) {
    ui.notifications.warn("Select a token to tag (or untag) as Evil.");
  } else {
    const results = [];
    for (const token of tokens) {
      const actor = token.actor ?? token.document?.actor;
      if (!actor) { results.push(`${token.name}: no actor`); continue; }

      // Toggle: read the current hidden flag (or fall back to the visible
      // condition state for mixed setups).
      const current = actor.getFlag(FLAG_ROOT, "evil") ??
        (token.document?.hasStatusEffect(EVIL_CONDITION) ?? false);
      const next = !current;

      if (USE_HIDDEN_FLAG) {
        if (next) await actor.setFlag(FLAG_ROOT, "evil", true);
        else await actor.unsetFlag(FLAG_ROOT, "evil");
        if (MIRROR_VISIBLE) {
          await token.document?.toggleStatusEffect(EVIL_CONDITION, { active: next });
        }
      } else {
        await token.document?.toggleStatusEffect(EVIL_CONDITION, { active: next });
      }
      results.push(`${token.name}: ${next ? "tagged Evil" : "Evil tag cleared"}`);
    }

    // Whisper the result to the GM only - the tag may be hidden from
    // players, so the announcement must not leak it into public chat.
    const content = results.map((r) => `<p>${r}</p>`).join("");
    await ChatMessage.create({
      whisper: ChatMessage.getWhisperRecipients("GM"),
      speaker: ChatMessage.getSpeaker({ actor: game.user.character ?? undefined }),
      flavor: "🕯️ Cleanse Evil",
      content,
    });
  }
}
