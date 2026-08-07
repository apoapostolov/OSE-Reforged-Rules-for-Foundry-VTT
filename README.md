# OSE Reforged Rules for Foundry VTT

[![Foundry VTT v14](https://img.shields.io/badge/Foundry%20VTT-v14-green)](https://foundryvtt.com/)
[![OSE System](https://img.shields.io/badge/OSE-2.3.0%2B-blue)](https://foundryvtt.com/packages/ose)
[![Module Version](https://img.shields.io/badge/version-1.2.0-blue)](./module.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Compendium module for [Old-School Essentials](https://foundryvtt.com/packages/ose)
containing **APO's Reforged class features** for every class.

Each class folder in the `Reforged Class Features` compendium contains the full,
play-ready set of class abilities for that class under APO's house rules:

- **Standard** abilities, copied unchanged from the official OSE class abilities
- **Modified** abilities: official features reworked by the Reforged rules
  (renamed where required, e.g. *Immunity to Ghoul Paralysis* →
  *Immunity to Sleep and Paralysis*)
- **New** abilities: features added by the Reforged rules (e.g. the Fighter's
  *Cleave*, the Cleric's *Holy Sense*)

Every item carries a `flags.ose-apo-reforged-rules.origin` marker
(`standard` | `modified` | `new`) so GMs can filter at a glance.

## Automation

This module ships two automation layers, following the official OSE module's
metadata pattern and going one step further with Active Effects:

- **4 Active Effects** that apply automatically when the item is placed on a
  character: Halfling Stout Heart (+2 spell saves), Halfling Missile Attack
  Bonus (+1 missile), Halfling Initiative Bonus (+1 initiative), Svirfneblin
  Illusion Resistance (+2 spell saves).
- **Roll/save metadata on 84 items** so every dice-mechanic ability
  (X-in-6 checks, percentile skills, save triggers) is rollable directly
  from the character sheet, with blind rolls for secret GM checks.

Full documentation of every effect, what it does, what you see, and where it
affects the OSE system: **[docs/AUTOMATION.md](docs/AUTOMATION.md)**.

## Automation by class

Every class below has its Reforged abilities in the compendium. This table
shows which of those abilities are automated, what the automation does, and
exactly how to trigger it. Features without automation are descriptive only:
the full rule text is in [docs/house-rules/OSE_HOUSE_RULES.md](docs/house-rules/OSE_HOUSE_RULES.md)
and the GM applies them by hand.

### Legend

| Badge | Meaning |
|---|---|
| 🪄 Active Effect | Applies a permanent bonus as soon as the item is on your sheet. Nothing to click. |
| 🎲 Rollable | The ability rolls dice from the sheet. Click the dice icon on the ability in your Abilities tab. |
| 🔘 Chat Button | A button appears on a chat card when the situation happens. Click it to roll. |
| 🎚️ Toggle | A button in the header of your character sheet. Click to turn on or off. |
| ⚔️ Roll Bonus | Added to your attack or damage roll automatically. You see it in the roll formula. |
| 💤 Status Block | Prevents a status (sleep, paralysis) from being applied to you. Automatic. |
| 🛡️ Save Trigger | The ability rolls a saving throw when you use it. Click the dice icon to roll. |

### Basic Classes

#### Cleric
| Feature | What the rule does | How to use it |
|---|---|---|
| ⚖️ Faith's Influence | +1 on Reaction checks and Wisdom/Charisma checks when the target recognizes your religion. | Toggle on in your sheet header while negotiating. The +1 applies automatically to your WIS and CHA checks. |
| 🎲 Cure Disease (Ritual) | 1-in-6 ritual chance to cure a disease. | Click the dice icon on the ability. 1-4 succeeds. |

#### Fighter
| Feature | What the rule does | How to use it |
|---|---|---|
| ⚔️ Cleave | After killing an enemy with a melee attack, you may make one extra melee attack (2 at 5th, 3 at 9th, 4 at 13th). | On a successful melee hit card, click the Cleave button when the target drops to 0 HP. It rolls a new melee attack. |

#### Magic-User

No automated effects. The class abilities are descriptive only; the
GM adjudicates them by hand.

#### Thief
| Feature | What the rule does | How to use it |
|---|---|---|
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
|---|---|---|
| 💤 Immunity to Sleep and Paralysis | Sleep and paralysis spells and effects never affect you. | Automatic. If something tries to apply sleep or paralysis, the module blocks it and posts a notice. |
| 🎲 Detect Secret Doors | 2-in-6 chance to spot secret doors. | Click the dice icon. Blind roll for the GM. |
| 🎲 Listening at Doors | 2-in-6 chance to hear noise through a door. | Click the dice icon. Blind roll. |
| 🤺 Dex Finesse (Drow arms) | Use DEX instead of STR for attack and damage with drow-made weapons. | Automatic when you attack with a drow-made weapon. The roll formula shows your DEX bonus. |
| 🎲 Poisoncraft (Spiders) | Brew spider poison, 1d3 doses. | Click the dice icon to roll the number of doses. |

#### Dwarf
| Feature | What the rule does | How to use it |
|---|---|---|
| ⛰️ Stout Fortune | Once per day, reroll a failed save vs Death/Poison, Paralysis/Petrify, or Spells (not Rods/Wands/Staves). | When one of those saves fails in chat, click the Reroll button on the card. Once per day. |
| 🗿 Attack Giant Foes | +2 to attack rolls against giants and creatures larger than human-sized. | Automatic when you attack a giant (name or 8+ HD). The attack roll formula includes +2. |
| 🎲 Detect Construction Tricks | 2-in-6 chance to find new construction, sliding walls, traps. | Click the dice icon. Blind roll. |
| 🎲 Detect Room Traps | 2-in-6 chance to spot room traps. | Click the dice icon. Blind roll. |
| 🎲 Listening at Doors | 2-in-6 chance to hear noise through a door. | Click the dice icon. Blind roll. |

#### Duergar
| Feature | What the rule does | How to use it |
|---|---|---|
| 🛡️ Iron Will | Once per day, reroll a failed save vs Poison or Spells. | When one of those saves fails in chat, click the Reroll button on the card. Once per day. |
| 💥 Harm Giant Foes | +2 to damage rolls against giants and creatures larger than human-sized. | Automatic when you hit a giant. The damage formula includes +2. |
| 🎲 Detect Construction Tricks | 2-in-6 chance to find new construction, sliding walls, traps. | Click the dice icon. Blind roll. |
| 🎲 Detect Room Traps | 2-in-6 chance to spot room traps. | Click the dice icon. Blind roll. |
| 🎲 Listening at Doors | 2-in-6 chance to hear noise through a door. | Click the dice icon. Blind roll. |
| 🎲 Stealth | 3-in-6 chance to move stealthily. | Click the dice icon. Blind roll. |

#### Elf
| Feature | What the rule does | How to use it |
|---|---|---|
| 💤 Immunity to Sleep and Paralysis | Sleep and paralysis spells and effects never affect you. | Automatic. The module blocks sleep/paralysis and posts a notice. |
| 🎲 Detect Secrets | 2-in-6 chance to detect hidden doors. | Click the dice icon. Blind roll. |
| 🎲 Listening at Doors | 2-in-6 chance to hear noise through a door. | Click the dice icon. Blind roll. |
| 🤺 Elven Finesse | Use DEX instead of STR for attack and damage with elven-made weapons. | Automatic when you attack with an elven-made weapon. |

#### Gnome
| Feature | What the rule does | How to use it |
|---|---|---|
| 🎲 Terrain Hiding | 4-in-6 chance to hide in natural terrain. | Click the dice icon. Blind roll. |
| 🎲 Detect Construction Tricks | 2-in-6 chance to find new construction, sliding walls, traps. | Click the dice icon. Blind roll. |
| 🎲 Hiding In Dungeons | 2-in-6 chance to hide in dungeon surroundings. | Click the dice icon. Blind roll. |
| 🎲 Hiding in Woods/Undergrowth | 90% chance to hide in woods. | Click the dice icon. Blind roll. |
| 🎲 Listening at Doors | 2-in-6 chance to hear noise through a door. | Click the dice icon. Blind roll. |

#### Half-Elf
| Feature | What the rule does | How to use it |
|---|---|---|
| 💤 Immunity to Sleep and Paralysis | Sleep and paralysis spells and effects never affect you. | Automatic. The module blocks sleep/paralysis and posts a notice. |
| 🤺 Mixed Finesse | Use DEX instead of STR for attack and damage with elven or human weapons you choose. | Automatic when you attack with a finesse-tagged weapon. |
| 🎲 See Through Pretense | 1-in-6 chance to see through disguise or pretense. | Click the dice icon. Blind roll. |

#### Half-Orc
| Feature | What the rule does | How to use it |
|---|---|---|
| 💀 Grim Tenacity | When reduced to 0 HP, save vs Death to stay conscious until the end of the next round or -10 HP. | When your HP hits 0, a chat card appears with the save button. Click it. Once per day. |
| 🎲 Hide in shadows (HS) | 1d100 under your chance to hide in shadows. | Click the dice icon. Blind roll. |
| 🎲 Move Silently (MS) | 1d100 under your chance to move silently. | Click the dice icon. Blind roll. |
| 🎲 Pick pockets (PP) | 1d100 under your chance to pick a pocket. | Click the dice icon. |
| 🎲 Brutal Grapple | Grapple deals 1d4 damage. | Click the dice icon to roll the damage. |

#### Halfling
| Feature | What the rule does | How to use it |
|---|---|---|
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
|---|---|---|
| 🪄 Illusion Resistance | +2 to spell saving throws. | Automatic as soon as the item is on your sheet. |
| 🎲 Blend into Stone | 4-in-6 (gloomy) or 2-in-6 (well-lit) chance to blend into stone. | Click the dice icon on the matching ability. Blind roll. |
| 🎲 Stone Murmurs | 2-in-6 chance to hear stone speak. | Click the dice icon. Blind roll. |
| 🎲 Stone Camouflage | 4-in-6 chance to hide in stone surroundings. | Click the dice icon. Blind roll. |
| 🎲 Detect Construction Tricks | 2-in-6 chance to find new construction, sliding walls, traps. | Click the dice icon. Blind roll. |
| 🛡️ Sure-Footed | Save vs Breath when exposed to effects that move or topple you. | Click the dice icon on the ability to roll the Breath save. |

### Advanced Classes

#### Acrobat
| Feature | What the rule does | How to use it |
|---|---|---|
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
|---|---|---|
| 🛡️ Assassination (AS) | When you assassinate, the target saves vs Death or dies. | Click the dice icon on the ability to roll the target's Death save. |
| 🎲 Disguise | 1d100 over 3 to keep a disguise. | Click the dice icon. Blind roll. |
| 🎲 Hear noise (HN) | 1-in-6 chance to hear noise through a door. | Click the dice icon. Blind roll. |
| 🎲 Hide in shadows (HS) | 1d100 under your chance to hide in shadows. | Click the dice icon. Blind roll. |
| 🎲 Move Silently (MS) | 1d100 under your chance to move silently. | Click the dice icon. Blind roll. |
| 🎲 Climb sheer surfaces (CS) | 1d100 under your chance to climb. | Click the dice icon. |

#### Barbarian
| Feature | What the rule does | How to use it |
|---|---|---|
| 🛡️ Damage Reduction | Reduces all damage taken from non-magical attacks by 1 (2 at 9th level), never below 1. | Automatic. The module subtracts the DR when damage is applied to you. |
| 👁️ Battle Senses | When surprised, unaware, or blind-fighting, enemies get +2 to hit you instead of +4. When surprised or in darkness, save vs Death to prevent doubled damage. | Click the Battle Senses button in your sheet header to roll the Death save. The +2 instead of +4 is a GM judgment. |
| 🎲 Climb Sheer Surfaces (CS) | 1d100 under your chance to climb. | Click the dice icon. |
| 🎲 Foraging | 2-in-6 chance to find food and water. | Click the dice icon. |
| 🎲 Hunting | 5-in-6 chance to hunt game. | Click the dice icon. |
| 🎲 Hide In Undergrowth (HD) | 1d100 under your chance to hide in undergrowth. | Click the dice icon. Blind roll. |
| 🎲 Move Silently (MS) | 1d100 under your chance to move silently. | Click the dice icon. |

#### Bard
| Feature | What the rule does | How to use it |
|---|---|---|
| 🛡️ Stunning Flourish | Your flourish stuns a target unless it saves vs Spells. | Click the dice icon on the ability to roll the target's Spell save. |
| 🎲 Lore | 2-in-6 chance to know a piece of lore. | Click the dice icon. |
| 🎲 Bardic Knowledge | 1-in-6 chance to recall a relevant fact. | Click the dice icon. Blind roll. |

#### Druid
| Feature | What the rule does | How to use it |
|---|---|---|
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
|---|---|---|
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
|---|---|---|
| 🎯 Precise Strikes | Add your INT modifier to attack and damage rolls with weapons you are proficient in. | Automatic. Your attack and damage formulas include your INT bonus. |
| 🎲 Sage Skills | 1d100 under your chance to succeed at a learned skill. | Click the dice icon. |
| 🎲 Erudite Sense | 1d100 under your chance to sense the value of knowledge. | Click the dice icon. Blind roll. |
| 🎲 Keen Observation | 1d100 under your chance to notice a detail. | Click the dice icon. |
| 🎲 Medical Prowess | 1d100 under your chance to treat wounds. | Click the dice icon. |
| 🎲 Research (Downtime) | 1d100 under your chance to complete research. | Click the dice icon. Blind roll. |
| 🎲 Workshop (Downtime) | 1d100 under your chance to produce from your workshop. | Click the dice icon. |

> **Tip:** every automated chat button and sheet toggle has a hover tooltip
> quoting the exact rule text. Hover over a button to see why it is there.

Disable the entire runtime layer with the `Reforged Tier 1 Automation`
module setting if you prefer manual play.

## Installation

1. In Foundry VTT, open **Add-on Modules** → **Install Module**.
2. Paste the manifest URL:

   ```
   https://github.com/apoapostolov/OSE-Reforged-Rules-for-Foundry-VTT/releases/latest/download/module.json
   ```

3. Enable the module in your world.

## Contents

Compendium: **Reforged Class Features** (Item, system `ose`)

| Folder | Classes |
|---|---|
| Basic Classes | Cleric, Fighter, Magic-User, Thief |
| Demihuman Classes | Drow, Dwarf, Duergar, Elf, Gnome, Half-Elf, Half-Orc, Halfling, Svirfneblin |
| Advanced Classes | Acrobat, Assassin, Barbarian, Bard, Druid, Illusionist, Knight, Paladin, Ranger |
| New Classes | Sage |

## Usage

1. Install and enable the module.
2. Open the **Reforged Class Features** compendium.
3. Open the folder for the character's class and drag the abilities onto the
   actor sheet (or drag the whole folder).

## Sources

The full Reforged ruleset is published in this repo under
**[docs/house-rules/](docs/house-rules/)**:

- `OSE_HOUSE_RULES.md`: the complete Reforged ruleset (class rework for all
  Basic / Demihuman / Advanced classes, combat, skills, downtime), v1.3.5
- `OSE_NEW_CONTENT.md`: the Sage class and other new content
- `CHANGELOG.md`: house rules version history
- `TORCH_REALISM_SLAVIC.md`: optional Feudal Slavic lighting subsystem
- `D&D_DESCRIPTORS.md`: ability score descriptions for roleplay

The compendium items are generated from:

- The class sections of `OSE_HOUSE_RULES.md` and `OSE_NEW_CONTENT.md`
- Official OSE class abilities (Advanced Fantasy Player's Tome module)
- [ose-statblock-importer](https://github.com/apoapostolov/OSE-Statblock-Importer-for-Foundry-VTT)
  `homebrew/homebrew.json`: machine-readable homebrew abilities/modifications
  used by the character importer

## Regenerating the packs

The packs are generated, not hand-edited:

```bash
python3 scripts/generate_packs.py    # reads sources -> /tmp/reforged-pack-manifest.json
node scripts/build_pack.mjs          # writes packs/reforged-class-features/
```

Change a house rule? Update the sources, rerun, bump version.

## Compatibility

- Foundry VTT v13 / v14
- OSE system 2.3.0+

## License

MIT: see [LICENSE](./LICENSE).
