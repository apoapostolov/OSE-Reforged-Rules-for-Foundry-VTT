# OSE Reforged Rules - Automation TODO

This document lists the Reforged class features that are **not automated
yet**. Every feature on this page works fine in the game: the full rule text
is in the compendium and on your sheet, and you or your GM apply it by hand.
What is missing is the module doing it for you.

Read this page if you want to know what is coming, or if you want to argue
for a feature to move up the list. The companion guide for what already
works is [docs/AUTOMATION.md](docs/AUTOMATION.md); the technical roadmap is
in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## How to read this page

| Column | What it means |
|---|---|
| Feature | The class feature (click the name in the compendium to read the rule). |
| Today | What you do by hand right now. |
| Why not yet | The honest reason the module cannot do it today. |
| When automated | What it will feel like when the module takes it over. |

There is no date on any of this. The features are listed in rough priority
order, and the priority comes from how much bookkeeping each one removes
versus how hard it is to build safely.

**Progress:** 9 of the original 14 automatable features are now automated
(Smite Evil, Dedication to Law and Good, Enemy Slayer, Dark Assassination,
Charge Fury, Stubborn Vitality, Blink Away, Illusion Savvy, Battle Oath).
Five remain below, plus four that are deliberately left to the table.

## Likely next

### Bard - Battle Songs

- **Today:** When you sing or play during a round, you announce +2 to ally
  Morale or -2 to enemy attack rolls, and everyone tracks it mentally.
- **Why not yet:** The morale bonus applies to allies, but morale in this
  game exists only on monster sheets. The module has nowhere to put an ally
  morale bonus, and applying the enemy penalty round by round needs a
  timer.
- **When automated:** You pick Sing or Play at initiative, the module adds
  the bonus to the right group for that round, and removes it when the
  round ends. No one forgets the song is up.

### Sage - Keen Observation (the targeted bonus part)

- **Today:** The percentile roll is on the sheet. The temporary bonus the
  Sage grants to a studied target is applied by hand.
- **Why not yet:** Granting a temporary bonus to another creature's token
  needs a "grant effect to target" flow the module does not have yet.
- **When automated:** You click the target, the module places a small timed
  bonus on its sheet, and the bonus expires on its own. Same for any
  future "study the enemy" effects.

### Half-Elf - Awareness

- **Today:** When the party is surprised, you roll 1d6 and act normally on
  a 1-3. Everyone waits while you roll and compare.
- **Why not yet:** Surprise rounds are not a thing the game system tracks.
  The module cannot know a surprise round started.
- **When automated:** The GM clicks "surprise round," the module rolls your
  1d6 quietly, and if you are not surprised it tells you so and lets you
  act. No awkward "did anyone remember the half-elf?"

### Ranger - Vigilant Guide

- **Today:** In your favored terrain, you reduce the party's surprise chance
  from 2-in-6 to 1-in-6, and you remind the GM.
- **Why not yet:** Same surprise-round gap. There is nowhere honest to put a
  party-wide surprise modifier yet.
- **When automated:** Your favored terrain toggle is on, the module feeds
  the reduced chance into the GM's surprise roll, and the party simply gets
  surprised less often without anyone remembering the rule.

### Ranger - Rough Company

- **Today:** You apply -2 to morale when recruiting or keeping non-animal
  retainers, and +2 with animal companions. You track which retainer is
  which.
- **Why not yet:** Retainer morale lives in the GM's head and notes, not in
  a field the module can touch.
- **When automated:** You click a retainer type, the module computes the
  correct morale modifier and shows it on the hireling's card. The
  recruiting math stops being a spreadsheet.

## Likely stays manual

These are probably not worth automating, and the module will likely leave
them to the table. They depend on fiction, judgment, or free-form roleplay
that no module can read:

- **Cleric - Turn Undead** (the GM-facing table part): it works as a roll
  and the results are a table the GM adjudicates.
- **Social and reaction features** (Diplomat, Faith's Influence nuance,
  hireling morale): they live in conversation, not in numbers on a sheet.
- **Downtime and domain play** (strongholds, research, carousing): they are
  campaign bookkeeping, and each table runs them differently.
- **Environmental rulings** (lighting, terrain, encumbrance judgment):
  reading the fiction is the GM's job.

If one of these becomes a real pain at your table, say so. The list is
priority-ordered, and pain is the best argument.

## How to push a feature up the list

1. Open an issue on the GitHub repository (link in the README).
2. Say which feature and what it cost you at the table.
3. That is it. The list above is reordered by real reports, not guesses.
