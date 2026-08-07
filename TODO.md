# OSE Reforged Rules - Automation TODO

This document lists the Reforged class features that are **not automated
yet**. Every feature on this page works fine in the game: the full rule text
is in the compendium and on your sheet, and you or your GM apply it by hand.
What is missing is the module doing it for you.

Read this page if you want to know what is coming, or if you want to argue
for a feature to move up the list. The companion guide for what already
works is [docs/AUTOMATION.md](docs/AUTOMATION.md); the technical roadmap is
in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Status

**All 14 automatable class features are now automated.** The four features
below the original roadmap were completed in the macro layer (GM tools in
the Reforged Utility Macros compendium) plus two module wrappers:

- **Bard - Battle Songs:** macro toggles Sing (+2 ally Morale) or Play
  (enemies -2 attack unless they hit the Bard). The module reads the Play
  flag during attack rolls and applies the penalty.
- **Sage - Keen Observation:** macro targets a foe, rolls the Observation
  skill, and on success applies a timed bonus (+1 attack, +1/+2 damage by
  Sage level) that all allies attacking the studied target benefit from.
- **Half-Elf - Awareness:** the Surprise Check macro auto-detects the
  Half-Elf and sets the party surprise chance to 3-in-6 (surprised only on
  1-3).
- **Ranger - Vigilant Guide:** the Surprise Check macro auto-detects the
  Ranger and sets the party surprise chance to 1-in-6.
- **Ranger - Rough Company:** the Hireling Loyalty macro auto-detects the
  Ranger and reminds the GM of the -2 morale for non-animal retainers
  (+2 for animal companions).

The features that were deliberately left to the table (social nuance,
downtime/domain play, environmental rulings) remain manual by design.

## Future ideas

These are not feature gaps - the features above are automated - but
quality-of-life ideas if a table finds a rule painful in play:

- **Druid - Natural Healing:** a Rest macro that rolls 1d3 HP recovery for
  the party after a full day of rest, and double recovery under a Druid's
  favored terrain.
- **Poison/disease save handling:** a macro that looks up the save target
  for a poison type and rolls the save for the affected character.
- **Downtime automation:** a Settlements macro that rolls the philanthropy
  threshold consequences automatically when a party crosses a settlement
  donation threshold.
