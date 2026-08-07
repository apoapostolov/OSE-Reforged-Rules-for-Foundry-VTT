# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow
SemVer: MAJOR for breaking changes, MINOR for new features, PATCH for fixes.

The [Unreleased] section tracks work that has not shipped yet.

## [Unreleased]

Nothing pending.

## [1.2.1] - 2026-08-07

Final class-feature automation: the last five automatable Reforged
features now have runtime support, so every automatable class feature in
the module is covered.

### Added (for players)

- **Battle Songs (Bard):** use the Battle Songs macro to choose Sing
  (+2 ally Morale) or Play (enemies -2 to attack rolls unless they
  target the Bard). The module reads the Play flag during attack rolls
  and applies the penalty automatically.
- **Keen Observation (Sage):** use the macro to study a foe. On a
  successful Observation roll, allies attacking the studied target gain
  a bonus to attack and damage that scales with Sage level. The module
  applies the bonus on attack rolls.

### Added (for the GM)

- **Surprise Check macro:** now detects Half-Elf Awareness (surprised
  only on 1-3) and Ranger Vigilant Guide (party surprised on 1-in-6)
  from party tokens and pre-selects the correct chance.
- **Hireling Loyalty macro:** now detects Ranger Rough Company and
  reminds the GM of the morale modifier for non-animal retainers.
- **Rest & Healing macro:** rolls and applies recovery for a full rest
  or bed rest, with an optional Druid Natural Healing double rate.
- **Poison Save macro:** rolls the save vs Poison (death column) for the
  six OSE poison types, reading the target's save value from the sheet.
- **Philanthropy macro:** full house-rules settlement donations with
  thresholds, XP calculation, and the 2d6 consequences table.

### Changed

- The utility macro suite is now 18 macros in the world-level
  **Reforged Utility Macros** compendium (GM dungeon tools, judgment
  rolls, and player dialogs).

## [1.2.0] - 2026-08-07

Tier 1 automation for Reforged class features, plus the user documentation
and the full house rules source.

### Added (for players)

- Chat-card option buttons with emoji and hover tooltips that quote the
  rule text:
  - ⚔️ Cleave (Fighter): extra melee attack on a successful hit.
  - 🤸 Dodge Die (Acrobat): d4/d6/d8/d10 AC against an incoming attack,
    once per round.
  - Rerolls for failed saves: 🍀 Lucky (Halfling), ⛰️ Stout Fortune
    (Dwarf), 🛡️ Iron Will (Duergar), 💨 Acrobat Evasion (Acrobat). Each
    once per day, restricted to the save categories the feature covers.
- Automatic roll bonuses, applied to the roll formula at the source:
  - 🗿 Attack Giant Foes (Dwarf): +2 to attack giants.
  - 💥 Harm Giant Foes (Duergar): +2 to damage giants.
  - 🎯 Precise Strikes (Sage): INT modifier to attack and damage.
  - 🤺 Finesse (Drow/Elf/Half-Elf): DEX instead of STR on melee.
  - 🛡️ Underfoot Defense (Halfling): large foes take -1 to hit you.
  - 🛡️ Damage Reduction (Barbarian): DR 1 (2 at 9th level), minimum 1
    damage.
- Sheet header toggles and rolls: 🏃 Fleet in Terrain (Ranger), ⚖️ Faith's
  Influence (Cleric), 🛡️ Shield Stand (Knight), 👁️ Battle Senses
  (Barbarian).
- 💤 Sleep/Paralysis Immunity (Drow/Elf/Half-Elf): the module blocks sleep
  and paralysis statuses from being applied.
- 💀 Grim Tenacity (Half-Orc): a save-vs-Death card appears when you drop
  to 0 HP.
- A module setting (`Reforged Tier 1 Automation`) turns the whole runtime
  layer off.

### Added (documentation)

- Per-class automation guide for players: every automated effect, what the
  rule does, how to trigger it ([docs/AUTOMATION.md](docs/AUTOMATION.md)).
- Developer documentation: what is implemented, the architecture, and the
  Tier 2+ roadmap ([docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)).
- The full Reforged house rules set under `docs/house-rules/` (rules,
  Sage class, rules changelog, optional lighting subsystem, ability score
  descriptions).
- Internal management and statblock-importer documents are not published,
  and the official OSE Player's Tome text is excluded for copyright.

## [1.1.0] - 2026-08-07

First automation layer: Active Effects and roll/save metadata.

### Added

- 4 Active Effects that apply automatically when the item is placed on a
  character:
  - Halfling **Stout Heart**: +2 to spell saves.
  - Halfling **Missile Attack Bonus**: +1 to missile attack rolls.
  - Halfling **Initiative Bonus**: +1 to initiative (optional rule).
  - Svirfneblin **Illusion Resistance**: +2 to spell saves vs illusions.
- Roll/save metadata on 84 items, following the official OSE module's
  pattern. Every dice-mechanic ability (X-in-6 checks, Thief and other
  percentile skills, Sage skills, save triggers) is rollable directly from
  the character sheet. Secret GM checks are blind rolls.
- House-rule level 1 values on reworked percentile skills (Open Locks 10%,
  Climb 25%, Acrobat CS 40%, Tightrope 40%, and so on).
- Full automation documentation in `docs/AUTOMATION.md`.

## [1.0.0] - 2026-08-07

Initial release.

### Added

- **Reforged Class Features** compendium: 255 items across 23 classes
  (Basic: 4, Demihuman: 9, Advanced: 9, New: 1 Sage).
- Each class folder mixes standard (unmodified) OSE abilities,
  APO-modified abilities, and new APO abilities, tagged with
  `flags.ose-apo-reforged-rules.origin`.
- Sage class authored from `OSE_NEW_CONTENT.md` (Precise Strikes, Sage
  Skills, Broad Knowledge, Erudite Sense, Keen Observation, Medical
  Prowess, Research, Workshop, Savant).
- Generated from the house rules sources; regenerate with
  `scripts/generate_packs.py` + `scripts/build_pack.mjs`.

[Unreleased]: https://github.com/apoapostolov/OSE-Reforged-Rules-for-Foundry-VTT/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/apoapostolov/OSE-Reforged-Rules-for-Foundry-VTT/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/apoapostolov/OSE-Reforged-Rules-for-Foundry-VTT/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/apoapostolov/OSE-Reforged-Rules-for-Foundry-VTT/releases/tag/v1.0.0
