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

## Likely next

### Paladin - Smite Evil

- **Today:** When you roll a natural 20 (19 at 9th, 18 at 14th) against an
  evil creature, you compute max damage plus an extra damage roll by hand
  and announce it.
- **Why not yet:** The module would need to watch every attack roll, detect
  a natural 20, check the target is evil, and then roll twice as much
  damage. That is a real attack-pipeline change, not a button.
- **When automated:** You roll to hit, and if it is a smite the module
  announces it, rolls max damage plus the extra die, and adds both to the
  damage total. No math, no forgetting the extra roll.

### Paladin - Dedication to Law and Good

- **Today:** You mentally apply +1 to hit against evil creatures with equal
  or higher HD, and +2 damage against evil creatures with lower HD, and
  you have to know which case you are in.
- **Why not yet:** The module would need to read the target's alignment and
  Hit Dice from its sheet, compare them to yours, and apply the right bonus
  to each roll. Monsters do not all carry a clean alignment value the
  module can trust.
- **When automated:** Your attack roll formula shows the correct bonus
  automatically for whatever you are fighting. You stop doing the
  HD-comparison math in your head.

### Ranger - Enemy Slayer (the hit and damage part)

- **Today:** The Death-save roll is already on the sheet. The +4 to hit and
  double damage when the enemy is unaware are applied by hand.
- **Why not yet:** The module cannot know an enemy is "unaware." There is no
  flag in the game for that, and guessing from token position would be
  wrong too often.
- **When automated:** You mark the target as unaware once (a button on its
  token), and the module rolls your attack at +4 and doubles the damage
  when it lands. The Death save stays one click.

### Drow - Dark Assassination

- **Today:** When you attack in pitch darkness, you apply +4 against
  unaware or blinded creatures, or forfeit the bonus to deal double damage.
- **Why not yet:** Same unawareness problem as Enemy Slayer, plus the module
  would need to know the scene is actually dark, which Foundry does not
  track for you.
- **When automated:** You flip a "darkness" toggle on the scene, mark your
  target as unaware, and the module offers you the choice: +4 to hit, or
  double damage. One click, no table lookup.

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

## Further out

These need more groundwork (mostly scene state or combat timers), so they
sit behind the list above.

### Barbarian - Charge Fury

- **Today:** When you charge, you add +2 to hit and +2 plus Strength to
  damage, and you can charge again after dropping an enemy.
- **Why not yet:** The module would need to know you are charging (a
  movement state it does not see) and track the extra charge.
- **When automated:** You declare a charge once, the module applies both
  bonuses to the roll, and it offers the follow-up charge automatically
  when you drop the target.

### Half-Orc - Stubborn Vitality

- **Today:** When you drop to 0 HP or lower, you reduce your Constitution by
  one less than normal (two less at 5th and 9th). You track the reduced
  loss by hand.
- **Why not yet:** The module already watches HP for Grim Tenacity, but
  changing a Constitution score on the fly is a bigger, riskier operation
  than showing a save button.
- **When automated:** You drop, and the module offers the Grim Tenacity
  save and then asks how much damage took you down, computes the reduced
  Constitution loss, and applies it. Two clicks instead of a pencil
  eraser.

### Gnome - Blink Away

- **Today:** Once per day, when you take damage, you declare you vanish
  until your next turn or until you take damage again.
- **Why not yet:** The module would need to apply an invisible state to your
  token, remove it on your next turn or on damage, and track the once-per-
  day use.
- **When automated:** You take damage, a Blink button appears on the damage
  card, you click it, your token becomes invisible, and it blinks back by
  itself when the effect ends.

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

### Illusionist - Illusion Savvy

- **Today:** When you can see an illusion, you roll a simple Wisdom check to
  disbelieve it for yourself. You ask the GM to roll, or roll and report.
- **Why not yet:** Illusions are not represented as objects in the game, so
  there is nothing for the module to attach the check to.
- **When automated:** You click the illusion (whatever the GM used to show
  it), the module rolls your Wisdom check against the target and tells only
  you the result. The GM stops being the middleman for every illusion.

### Knight - Battle Oath

- **Today:** Once per encounter, before initiative, you speak an oath that
  taunts opponents. You and the GM track who is taunted and for how long.
- **Why not yet:** It is a taunt with a duration and an intelligence check
  for smart enemies. That is encounter state the module does not manage.
- **When automated:** You click the oath, the module marks the taunted
  enemies for the encounter and rolls the intelligence check for clever
  ones automatically. Taunts stop being forgotten.

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
