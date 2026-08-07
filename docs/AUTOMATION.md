# OSE Reforged Rules - Automation Guide

This guide explains what this module automates, how to trigger each
automation, and what you will see. It is written for players and GMs who
use the module, not for developers. If you maintain the module or want to
extend it, see [DEVELOPMENT.md](DEVELOPMENT.md) instead.

## How automation works

The Reforged abilities on your character sheet come in three automation
layers. They stack, and you do not configure any of them: drag the ability
onto your sheet and the automation is active.

| Layer | What it does | Where you see it |
| --- | --- | --- |
| 🪄 Active Effect | Applies a permanent bonus the moment the item is on your sheet. Nothing to click. | The affected stat changes (saves, attack bonus, initiative). |
| 🎲 Rollable | The ability rolls dice from the sheet. | Click the dice icon on the ability in your Abilities tab. |
| 🔘 Chat Button | A button appears on a chat card when the situation happens. Click it to roll. | The card in the chat log, exactly when you need it. |
| 🎚️ Toggle | A button in the header of your character sheet. Click to turn on or off. | Your sheet header, under the name. |
| ⚔️ Roll Bonus | Added to your attack or damage roll automatically. | The roll formula in the chat card shows the bonus. |
| 💤 Status Block | Prevents a status (sleep, paralysis) from being applied to you. | Nothing appears unless the effect is blocked; then a notice card explains it. |
| 🛡️ Save Trigger | The ability rolls a saving throw when you use it. | Click the dice icon on the ability to roll the save. |

Two rules of thumb:

- **Every button has an emoji and a hover tooltip.** Hover over any button
  and the tooltip quotes the exact rule text, so you never have to guess
  what the button does.
- **Blind rolls stay blind.** Abilities marked for secret GM checks roll
  privately. Players see the result only when the GM shares it.

## What is automated, per class

Features without automation are descriptive only: the full rule text is in
[docs/house-rules/OSE_HOUSE_RULES.md](house-rules/OSE_HOUSE_RULES.md) and
the GM applies them by hand.

### Basic Classes

#### Cleric

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| ⚖️ Faith's Influence | +1 on Reaction checks and Wisdom/Charisma checks when the target recognizes your religion. | Toggle on in your sheet header while negotiating. The +1 applies automatically to your WIS and CHA checks. |
| 🎲 Cure Disease (Ritual) | 1-in-6 ritual chance to cure a disease. | Click the dice icon on the ability. 1-4 succeeds. |

#### Fighter

| Feature | What the rule does | How to use it |
|---|---|---|
| ⚔️ Cleave | After killing an enemy with a melee attack, you may make one extra melee attack (2 at 5th, 3 at 9th, 4 at 13th). | On a successful melee hit card, click the Cleave button when the target drops to 0 HP. It rolls a new melee attack. |

#### Magic-User

No automated effects. The class abilities are descriptive only; the GM
adjudicates them by hand.

#### Thief

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 🎲 Open Locks (OL) | 1d100 under your chance to pick a lock. | Click the dice icon on the ability. Roll is below your OL percentage. |
| 🎲 Find/remove treasure traps (TR) | 1d100 under your chance to find and remove a treasure trap. | Click the dice icon. Secret roll for the GM (blind). |
| 🎲 Climb sheer surfaces (CS) | 1d100 under your chance to climb. | Click the dice icon on the ability. |
| 🎲 Hide In Shadows (HS) | 1d100 under your chance to hide in shadows. | Click the dice icon. Blind roll. |
| 🎲 Move silently (MS) | 1d100 under your chance to move silently. | Click the dice icon. Blind roll. |
| 🎲 Pick Pockets (PP) | 1d100 under your chance to pick a pocket. | Click the dice icon on the ability. |
| 🎲 Hear noise (HN) | 1-in-6 chance to hear noise through a door. | Click the dice icon. Blind roll. |
| 🎲 Read Languages | 1d100 under your chance to read unknown languages. | Click the dice icon. |
| 🎲 Scroll Use | 1d100 over 11 to cast from a scroll. | Click the dice icon. Roll is above 11. |
| 🎲 After Reaching 9th Level | 2d6 retainers and a guild when you reach 9th level. | Click the dice icon when you level up. |

### Demihuman Classes

#### Drow

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 💤 Immunity to Sleep and Paralysis | Sleep and paralysis spells and effects never affect you. | Automatic. If something tries to apply sleep or paralysis, the module blocks it and posts a notice. |
| 🎲 Detect Secret Doors | 2-in-6 chance to spot secret doors. | Click the dice icon. Blind roll for the GM. |
| 🎲 Listening at Doors | 2-in-6 chance to hear noise through a door. | Click the dice icon. Blind roll. |
| 🤺 Dex Finesse (Drow arms) | Use DEX instead of STR for attack and damage with drow-made weapons. | Automatic when you attack with a drow-made weapon. The roll formula shows your DEX bonus. |
| 🎲 Poisoncraft (Spiders) | Brew spider poison, 1d3 doses. | Click the dice icon to roll the number of doses. |

#### Dwarf

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| ⛰️ Stout Fortune | Once per day, reroll a failed save vs Death/Poison, Paralysis/Petrify, or Spells (not Rods/Wands/Staves). | When one of those saves fails in chat, click the Reroll button on the card. Once per day. |
| 🗿 Attack Giant Foes | +2 to attack rolls against giants and creatures larger than human-sized. | Automatic when you attack a giant (name or 8+ HD). The attack roll formula includes +2. |
| 🎲 Detect Construction Tricks | 2-in-6 chance to find new construction, sliding walls, traps. | Click the dice icon. Blind roll. |
| 🎲 Detect Room Traps | 2-in-6 chance to spot room traps. | Click the dice icon. Blind roll. |
| 🎲 Listening at Doors | 2-in-6 chance to hear noise through a door. | Click the dice icon. Blind roll. |

#### Duergar

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 🛡️ Iron Will | Once per day, reroll a failed save vs Poison or Spells. | When one of those saves fails in chat, click the Reroll button on the card. Once per day. |
| 💥 Harm Giant Foes | +2 to damage rolls against giants and creatures larger than human-sized. | Automatic when you hit a giant. The damage formula includes +2. |
| 🎲 Detect Construction Tricks | 2-in-6 chance to find new construction, sliding walls, traps. | Click the dice icon. Blind roll. |
| 🎲 Detect Room Traps | 2-in-6 chance to spot room traps. | Click the dice icon. Blind roll. |
| 🎲 Listening at Doors | 2-in-6 chance to hear noise through a door. | Click the dice icon. Blind roll. |
| 🎲 Stealth | 3-in-6 chance to move stealthily. | Click the dice icon. Blind roll. |

#### Elf

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 💤 Immunity to Sleep and Paralysis | Sleep and paralysis spells and effects never affect you. | Automatic. The module blocks sleep/paralysis and posts a notice. |
| 🎲 Detect Secrets | 2-in-6 chance to detect hidden doors. | Click the dice icon. Blind roll. |
| 🎲 Listening at Doors | 2-in-6 chance to hear noise through a door. | Click the dice icon. Blind roll. |
| 🤺 Elven Finesse | Use DEX instead of STR for attack and damage with elven-made weapons. | Automatic when you attack with an elven-made weapon. |

#### Gnome

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 🎲 Terrain Hiding | 4-in-6 chance to hide in natural terrain. | Click the dice icon. Blind roll. |
| 🎲 Detect Construction Tricks | 2-in-6 chance to find new construction, sliding walls, traps. | Click the dice icon. Blind roll. |
| 🎲 Hiding In Dungeons | 2-in-6 chance to hide in dungeon surroundings. | Click the dice icon. Blind roll. |
| 🎲 Hiding in Woods/Undergrowth | 90% chance to hide in woods. | Click the dice icon. Blind roll. |
| 🎲 Listening at Doors | 2-in-6 chance to hear noise through a door. | Click the dice icon. Blind roll. |

#### Half-Elf

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 💤 Immunity to Sleep and Paralysis | Sleep and paralysis spells and effects never affect you. | Automatic. The module blocks sleep/paralysis and posts a notice. |
| 🤺 Mixed Finesse | Use DEX instead of STR for attack and damage with elven or human weapons you choose. | Automatic when you attack with a finesse-tagged weapon. |
| 🎲 See Through Pretense | 1-in-6 chance to see through disguise or pretense. | Click the dice icon. Blind roll. |

#### Half-Orc

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 💀 Grim Tenacity | When reduced to 0 HP, save vs Death to stay conscious until the end of the next round or -10 HP. | When your HP hits 0, a chat card appears with the save button. Click it. Once per day. |
| 🎲 Hide in shadows (HS) | 1d100 under your chance to hide in shadows. | Click the dice icon. Blind roll. |
| 🎲 Move Silently (MS) | 1d100 under your chance to move silently. | Click the dice icon. Blind roll. |
| 🎲 Pick pockets (PP) | 1d100 under your chance to pick a pocket. | Click the dice icon. |
| 🎲 Brutal Grapple | Grapple deals 1d4 damage. | Click the dice icon to roll the damage. |

#### Halfling

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 🪄 Stout Heart | +2 to spell saving throws. | Automatic as soon as the item is on your sheet. Nothing to click. |
| 🪄 Missile Attack Bonus | +1 to missile attack rolls. | Automatic. Your missile attack formula includes +1. |
| 🪄 Initiative Bonus | +1 to initiative rolls. | Automatic. Your initiative roll includes +1. |
| 🍀 Lucky | Once per day, reroll a failed save of any category. | When any save fails in chat, click the Reroll button on the card. Once per day. |
| 🛡️ Underfoot Defense | Creatures larger than human-sized take -1 to hit you in melee. | Automatic. A large attacker's roll formula includes -1 when targeting you. |
| 🎲 Terrain Hiding | 5-in-6 chance to hide in natural terrain. | Click the dice icon. Blind roll. |
| 🎲 Hiding In Dungeons | 2-in-6 chance to hide in dungeon surroundings. | Click the dice icon. Blind roll. |
| 🎲 Hiding in Woods/Undergrowth | 90% chance to hide in woods. | Click the dice icon. Blind roll. |
| 🎲 Listening at Doors | 2-in-6 chance to hear noise through a door. | Click the dice icon. Blind roll. |

#### Svirfneblin

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 🪄 Illusion Resistance | +2 to spell saving throws. | Automatic as soon as the item is on your sheet. |
| 🎲 Blend into Stone | 4-in-6 (gloomy) or 2-in-6 (well-lit) chance to blend into stone. | Click the dice icon on the matching ability. Blind roll. |
| 🎲 Stone Murmurs | 2-in-6 chance to hear stone speak. | Click the dice icon. Blind roll. |
| 🎲 Stone Camouflage | 4-in-6 chance to hide in stone surroundings. | Click the dice icon. Blind roll. |
| 🎲 Detect Construction Tricks | 2-in-6 chance to find new construction, sliding walls, traps. | Click the dice icon. Blind roll. |
| 🛡️ Sure-Footed | Save vs Breath when exposed to effects that move or topple you. | Click the dice icon on the ability to roll the Breath save. |

### Advanced Classes

#### Acrobat

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 🤸 Dodge Die | Once per round, when you would take damage from an attack, roll a d4 (d6 at 5th, d8 at 9th, d10 at 13th) and add it to your AC. If your AC then exceeds the attack roll, the attack still hits but deals only 1 damage. | When you are the target of an attack card, click the Dodge button before damage is applied. Once per round. |
| 💨 Acrobat Evasion | Once per day, reroll a failed save vs Breath or Spells. | When one of those saves fails in chat, click the Reroll button. Once per day. |
| 🎲 Climb sheer surfaces (CS) | 1d100 under your chance to climb. | Click the dice icon. |
| 🎲 Falling (FA) | 1d100 under your chance to fall without injury. | Click the dice icon. |
| 🎲 Hide in shadows (HS) | 1d100 under your chance to hide in shadows. | Click the dice icon. Blind roll. |
| 🎲 Move Silently (MS) | 1d100 under your chance to move silently. | Click the dice icon. Blind roll. |
| 🎲 Tightrope Walking (TW) | 1d100 under your chance to walk a tightrope. | Click the dice icon. Blind roll. |
| 🎲 Tumbling Strike | 25% chance to perform a tumbling strike. | Click the dice icon. |

#### Assassin

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 🛡️ Assassination (AS) | When you assassinate, the target saves vs Death or dies. | Click the dice icon on the ability to roll the target's Death save. |
| 🎲 Disguise | 1d100 over 3 to keep a disguise. | Click the dice icon. Blind roll. |
| 🎲 Hear noise (HN) | 1-in-6 chance to hear noise through a door. | Click the dice icon. Blind roll. |
| 🎲 Hide in shadows (HS) | 1d100 under your chance to hide in shadows. | Click the dice icon. Blind roll. |
| 🎲 Move Silently (MS) | 1d100 under your chance to move silently. | Click the dice icon. Blind roll. |
| 🎲 Climb sheer surfaces (CS) | 1d100 under your chance to climb. | Click the dice icon. |

#### Barbarian

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 🛡️ Damage Reduction | Reduces all damage taken from non-magical attacks by 1 (2 at 9th level), never below 1. | Automatic. The module subtracts the DR when damage is applied to you. |
| 👁️ Battle Senses | When surprised, unaware, or blind-fighting, enemies get +2 to hit you instead of +4. When surprised or in darkness, save vs Death to prevent doubled damage. | Click the Battle Senses button in your sheet header to roll the Death save. The +2 instead of +4 is a GM judgment. |
| 🎲 Climb Sheer Surfaces (CS) | 1d100 under your chance to climb. | Click the dice icon. |
| 🎲 Foraging | 2-in-6 chance to find food and water. | Click the dice icon. |
| 🎲 Hunting | 5-in-6 chance to hunt game. | Click the dice icon. |
| 🎲 Hide In Undergrowth (HD) | 1d100 under your chance to hide in undergrowth. | Click the dice icon. Blind roll. |
| 🎲 Move Silently (MS) | 1d100 under your chance to move silently. | Click the dice icon. |

#### Bard

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 🛡️ Stunning Flourish | Your flourish stuns a target unless it saves vs Spells. | Click the dice icon on the ability to roll the target's Spell save. |
| 🎲 Lore | 2-in-6 chance to know a piece of lore. | Click the dice icon. |
| 🎲 Bardic Knowledge | 1-in-6 chance to recall a relevant fact. | Click the dice icon. Blind roll. |

#### Druid

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 🎲 Shape Change | 1d4 times per day you can assume animal form. | Click the dice icon to roll the daily uses. |
| 🎲 Herbal Salves | 1d3 healing salves per day. | Click the dice icon to roll the daily count. |
| 🎲 Antivenom Craft | 5-in-6 chance to brew antivenom. | Click the dice icon. |
| 🎲 Path-Finding | 2-in-6 chance to find the path in the wilderness (roll over 2). | Click the dice icon. Blind roll. |

#### Illusionist

| Feature | What the rule does | How to use it |
|---|---|---|
| 🎲 Minor Conjurations | 3-in-6 chance to create a minor illusion. | Click the dice icon. Blind roll. |

#### Knight

| Feature | What the rule does | How to use it |
|---|---|---|
| 🛡️ Shield Stand | When you announce a shield stand before initiative, you and adjacent shield-wielding allies gain +2 to AC and +1 to Parry until your next turn, instead of +1. | Toggle Shield Stand in your sheet header. The +1 extra AC applies while on. Movement is still your call. |

#### Paladin

| Feature | What the rule does | How to use it |
|---|---|---|
| 🎲 Clean of Body | 2-in-6 chance to resist disease and poison. | Click the dice icon. |

#### Ranger

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 🏃 Fleet in Terrain | Your speed increases by 10 feet in your favored terrain when not impeded. | Toggle Fleet in Terrain in your sheet header when in your favored terrain. |
| 🛡️ Enemy Slayer | You may perform an assassination (like the Assassin class) against your common enemies: +4 to hit, double damage if they are unaware, and +1 to damage rolls. The target saves vs Death to survive the assassination. | Click the dice icon on the ability to roll the enemy's Death save when you strike. |
| 🎲 Foraging | 2-in-6 chance to find food and water. | Click the dice icon. |
| 🎲 Foraging and Hunting | 2-in-6 chance to forage and hunt. | Click the dice icon. |
| 🎲 Hunting | 5-in-6 chance to hunt game. | Click the dice icon. |
| 🎲 Stealth | 3-in-6 chance to move stealthily. | Click the dice icon. Blind roll. |
| 🎲 Tracking | 1d100 under your chance to track. | Click the dice icon. |

### New Classes

#### Sage

| Feature | What the rule does | How to use it |
| --- | --- | --- |
| 🎯 Precise Strikes | Add your INT modifier to attack and damage rolls with weapons you are proficient in. | Automatic. Your attack and damage formulas include your INT bonus. |
| 🎲 Sage Skills | 1d100 under your chance to succeed at a learned skill. | Click the dice icon. |
| 🎲 Erudite Sense | 1d100 under your chance to sense the value of knowledge. | Click the dice icon. Blind roll. |
| 🎲 Keen Observation | 1d100 under your chance to notice a detail. | Click the dice icon. |
| 🎲 Medical Prowess | 1d100 under your chance to treat wounds. | Click the dice icon. |
| 🎲 Research (Downtime) | 1d100 under your chance to complete research. | Click the dice icon. Blind roll. |
| 🎲 Workshop (Downtime) | 1d100 under your chance to produce from your workshop. | Click the dice icon. |

## What is not automated, and why

A few features look automatable but are not. Honest automation matters more
than automated-feeling automation: encoding a rule wrong is worse than
leaving it to the GM. These stay descriptive:

| Feature | Why it is not automated |
| --- | --- |
| Paladin Smite Evil | Triggers on natural 19/20 only. The OSE attack pipeline does not expose a clean hook for this yet. |
| Bard Battle Songs | Morale bonuses affect monsters; there is no ally-morale field in the OSE data model. |
| Drow Dark Assassination | Needs to know the target is unaware and the attacker is in darkness. That state is not tracked anywhere. |
| Ranger Enemy Slayer (full) | The assassination roll works from the sheet, but the +4 hit / double damage part needs target-awareness state. |
| Sage Keen Observation (full) | Would grant a temporary bonus to a target; needs a target-token hook that is not wired yet. |

These are candidates for the next automation tier. See
[DEVELOPMENT.md](DEVELOPMENT.md) for the roadmap.

## Turning automation off

The runtime layer (chat buttons, roll bonuses, toggles, status blocking)
can be disabled entirely with the `Reforged Tier 1 Automation` module
setting. The Active Effects and roll metadata always stay on: they are part
of the items themselves.

## Verification

After installing, drag a class folder onto a test character and check:

1. Rollable abilities show a dice icon in the Abilities tab.
2. Halfling: Spell save is 2 lower, missile attack has +1, initiative has
   +1 (the three Active Effects).
3. Attack a giant with a Dwarf: the attack formula includes +2.
4. Fail a save with a Halfling: the card shows a Reroll button.
