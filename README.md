# OSE Reforged Rules for Foundry VTT

[![Foundry VTT v14](https://img.shields.io/badge/Foundry%20VTT-v14-green)](https://foundryvtt.com/)
[![OSE System](https://img.shields.io/badge/OSE-2.3.0%2B-blue)](https://foundryvtt.com/packages/ose)
[![Module Version](https://img.shields.io/badge/version-1.2.1-blue)](./module.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Play-ready Reforged class features for Old-School Essentials: a compendium
of every class ability under APO's house rules, plus automation that rolls
dice, applies bonuses, and adds buttons to chat cards for you.

## What you get

**The compendium.** `Reforged Class Features` holds 255 items across 23
classes. Each class folder is complete and play-ready:

- **Standard** abilities, unchanged from official OSE
- **Modified** abilities, reworked by the Reforged rules (for example
  *Immunity to Ghoul Paralysis* became *Immunity to Sleep and Paralysis*)
- **New** abilities added by the house rules (for example the Fighter's
  *Cleave*, the Cleric's *Holy Sense*)

Every item carries an origin marker (`standard` | `modified` | `new`) so you
can filter at a glance.

**The automation.** This module does the bookkeeping for you. Rollable
abilities roll from the sheet, passive bonuses apply themselves, and the
things that need a decision (extra attacks, rerolls, dodges) become buttons
on the chat card with a tooltip that quotes the rule. See
**[docs/AUTOMATION.md](docs/AUTOMATION.md)** for the full guide, or jump to
[Automation summary](#automation-summary) below.

**The rules.** The complete Reforged ruleset is published in
**[docs/house-rules/](docs/house-rules/)** so players can read any ability
in full context.

## Quick start

1. Install the module (see [Installation](#installation)).
2. Open the **Reforged Class Features** compendium.
3. Open the folder for your class and drag the abilities onto your actor
   sheet (or drag the whole folder).
4. Play. Bonuses apply automatically; dice roll from the sheet; chat cards
   grow buttons when a feature gives you a choice.

## Automation summary

Four layers, in the order they appear on your sheet:

| Layer | What it does | Where you see it |
| --- | --- | --- |
| 🪄 Active Effects (4) | Permanent bonuses that apply the moment the item is on your sheet | Stats change: saves, attack mods, initiative |
| 🎲 Roll metadata (84 items) | Every dice-mechanic ability rolls correctly from the sheet | Dice icon on the ability; blind rolls stay hidden |
| 🔘 Runtime buttons (v1.2.1+) | Chat-card buttons, roll bonuses, and toggles for features that need a decision | Buttons on attack/save cards; toggle row in the sheet header |
| 🎯 Macro automation (9 effects, 7 macros) | Player- and GM-triggered effects: click a macro to declare a charge, mark an enemy unaware, swear an oath, or tag a creature as Evil, and the module applies the effect on your next roll | Macros in the **Reforged Macros** compendium pack (drag to hotbar); results appear on your attack cards and in chat |

Every button has an emoji and a hover tooltip that quotes the rule text, so
you never have to guess what a button does. The full per-class breakdown is
in **[docs/AUTOMATION.md](docs/AUTOMATION.md)**; the macro layer's
architecture and each macro's trigger is in
**[docs/MACRO_AUTOMATION.md](docs/MACRO_AUTOMATION.md)**.

## Installation

1. In Foundry VTT, open **Add-on Modules** → **Install Module**.
2. Paste the manifest URL:

   ```text
   https://github.com/apoapostolov/OSE-Reforged-Rules-for-Foundry-VTT/releases/latest/download/module.json
   ```

3. Enable the module in your world.

## Usage

1. Install and enable the module.
2. Open the **Reforged Class Features** compendium.
3. Open the folder for the character's class and drag the abilities onto the
   actor sheet (or drag the whole folder).
4. Read the ability descriptions for the rules; use the automation as shown
   in [docs/AUTOMATION.md](docs/AUTOMATION.md).

If you prefer manual play, disable the runtime layer with the `Reforged
Tier 1 Automation` module setting.

## Documentation

| Document | For | Contents |
| --- | --- | --- |
| [docs/AUTOMATION.md](docs/AUTOMATION.md) | Players and GMs | Every automated effect per class, what the rule does, how to trigger it |
| [docs/MACRO_AUTOMATION.md](docs/MACRO_AUTOMATION.md) | Players and GMs | The macro layer: each macro, what it triggers, the tag-toggle pattern |
| [TODO.md](TODO.md) | Players and GMs | Class features that are not automated yet, why, and what automation will feel like |
| [docs/house-rules/](docs/house-rules/README.md) | Players and GMs | The full Reforged ruleset the compendium is built from |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Developers | What is implemented, the architecture, what remains (Tier 2+) |
| [docs/FULL_AUTOMATION_BLUEPRINT.md](docs/FULL_AUTOMATION_BLUEPRINT.md) | Developers | Foundry v14 + OSE API notes and the feature automation map |

## Contents

Compendium: **Reforged Class Features** (Item, system `ose`)

| Folder | Classes |
| --- | --- |
| Basic Classes | Cleric, Fighter, Magic-User, Thief |
| Demihuman Classes | Drow, Dwarf, Duergar, Elf, Gnome, Half-Elf, Half-Orc, Halfling, Svirfneblin |
| Advanced Classes | Acrobat, Assassin, Barbarian, Bard, Druid, Illusionist, Knight, Paladin, Ranger |
| New Classes | Sage |

## Sources

- `OSE_HOUSE_RULES.md` (v1.3.5): the complete Reforged ruleset
- `OSE_NEW_CONTENT.md`: the Sage class
- Official OSE class abilities (Advanced Fantasy Player's Tome module)
- [ose-statblock-importer](https://github.com/apoapostolov/OSE-Statblock-Importer-for-Foundry-VTT)
  `homebrew/homebrew.json`: machine-readable homebrew data used by the
  character importer

## Compatibility

- Foundry VTT v13 / v14
- OSE system 2.3.0+

## License

MIT: see [LICENSE](./LICENSE).
