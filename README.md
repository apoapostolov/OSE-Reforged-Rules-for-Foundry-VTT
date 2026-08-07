# OSE Reforged Rules for Foundry VTT

Compendium module for [Old-School Essentials](https://foundryvtt.com/packages/ose)
containing **APO's Reforged class features** for every class.

Each class folder in the `Reforged Class Features` compendium contains the full,
play-ready set of class abilities for that class under APO's house rules:

- **Standard** abilities, copied unchanged from the official OSE class abilities
- **Modified** abilities — official features reworked by the Reforged rules
  (renamed where required, e.g. *Immunity to Ghoul Paralysis* →
  *Immunity to Sleep and Paralysis*)
- **New** abilities — features added by the Reforged rules (e.g. the Fighter's
  *Cleave*, the Cleric's *Holy Sense*)

Every item carries a `flags.ose-apo-reforged-rules.origin` marker
(`standard` | `modified` | `new`) so GMs can filter at a glance.

## Automation

This module ships two automation layers, following the official OSE module's
metadata pattern and going one step further with Active Effects:

- **4 Active Effects** (transfer: true) that apply passively when the item
  is placed on a character: Halfling Stout Heart (+2 spell saves), Halfling
  Missile Attack Bonus (+1 missile), Halfling Initiative Bonus (+1
  initiative), Svirfneblin Illusion Resistance (+2 spell saves).
- **Roll/save metadata on 84 items** so every dice-mechanic ability
  (X-in-6 checks, percentile skills, save triggers) is rollable directly
  from the character sheet, with blind rolls for secret GM checks.

Full documentation of every effect, what it does, what you see, and where it
affects the OSE system: **[docs/AUTOMATION.md](docs/AUTOMATION.md)**.

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

- [OSE_HOUSE_RULES.md](https://github.com/apoapostolov/lifestyle/blob/main/rpg_projects/houserules/old-school-essentials/OSE_HOUSE_RULES.md)
  — Class Rework section (Basic / Demihuman / Advanced classes)
- [OSE_NEW_CONTENT.md](https://github.com/apoapostolov/lifestyle/blob/main/rpg_projects/houserules/old-school-essentials/OSE_NEW_CONTENT.md)
  — the Sage class
- Official OSE class abilities (Advanced Fantasy Player's Tome module)
- `ose-statblock-importer` `homebrew/homebrew.json` — machine-readable homebrew
  abilities/modifications used by the character importer

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

MIT
