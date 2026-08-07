# CHANGELOG

## 1.2.0 - 2026-08-07

Docs: user-oriented README automation guide + house rules source published.

- README now lists **every automated effect per class** in tables with
  plain-language explanations and step-by-step trigger instructions
  (newbie-friendly: legend for the automation badges, per-class tables from
  Basic to New classes).
- Published the full Reforged house rules set under
  `docs/house-rules/` (OSE_HOUSE_RULES.md v1.3.5, OSE_NEW_CONTENT.md,
  CHANGELOG.md, TORCH_REALISM_SLAVIC.md, D&D_DESCRIPTORS.md). Internal
  management and statblock-importer docs are not published. The official
  OSE Player's Tome text is excluded (copyright).
- Notion links in OSE_HOUSE_RULES.md converted to local anchors; private
  Notion-hosted image replaced with a note.

Tier 1 automation layer: chat-card buttons, roll bonuses, and sheet toggles
for Reforged class features. Every button has an emoji/glyph and a hover
tooltip explaining the rule it applies.

- **Chat-card option buttons** (injected into OSE cards with native styling):
  - ⚔️ **Cleave** (Fighter): extra melee attack on successful hits.
  - 🤸 **Dodge Die** (Acrobat): roll the dodge die (d4/d6/d8/d10 by level)
    against an incoming attack, once per round.
  - 🍀 **Lucky** (Halfling), ⛰️ **Stout Fortune** (Dwarf), 🛡️ **Iron Will**
    (Duergar), 💨 **Acrobat Evasion**: once-per-day rerolls on failed saves,
    restricted to the save categories each feature covers.
- **Roll pipeline bonuses** (applied automatically at the source):
  - 🗿 **Attack Giant Foes** (Dwarf): +2 attack vs giants.
  - 💥 **Harm Giant Foes** (Duergar): +2 damage vs giants.
  - 🛡️ **Damage Reduction** (Barbarian): DR 1 (2 at 9th), min 1 damage.
  - 🎯 **Precise Strikes** (Sage): INT modifier to attack and damage.
  - 🤺 **Finesse** (Drow/Elf/Half-Elf): DEX instead of STR on melee.
- **Sheet header toggles** (with rule tooltips):
  - 🏃 **Fleet in Terrain** (Ranger), ⚖️ **Faith's Influence** (Cleric),
    🛡️ **Shield Stand** (Knight).
- **💤 Sleep/Paralysis Immunity** (Drow/Elf/Half-Elf): blocks sleep and
  paralysis statuses from being applied.
- 💀 **Grim Tenacity** (Half-Orc): save vs Death button on 0-hp cards.
- Giant detection: monster name pattern (giant/ogre/troll/ettin) or HD >= 8.
- Automation can be disabled in module settings (`automationEnabled`).

## 1.1.0 - 2026-08-07

Automation layer: Active Effects + roll/save metadata.

- **4 Active Effects** that apply automatically when the item is placed on a
  character:
  - Halfling **Stout Heart**: +2 to spell saves (charm/dominate/possess/compel).
  - Halfling **Missile Attack Bonus**: +1 to missile attack rolls (was a
    manual Tweaks entry in the official module, now automatic).
  - Halfling **Initiative Bonus**: +1 to initiative (optional rule).
  - Svirfneblin **Illusion Resistance**: +2 to spell saves vs illusions.
- **Roll/save metadata on 84 items** following the official OSE module's
  pattern: every dice-mechanic ability (X-in-6 checks, Thief/Acrobat/
  Barbarian/Assassin percentile skills, Sage skills, save triggers) is now
  rollable directly from the character sheet, with blind rolls for secret
  GM checks.
- House-rule level 1 values applied to reworked percentile skills
  (Open Locks 10%, Climb 25%, Acrobat CS 40%, TW 40%, etc.).
- Full automation documentation in `docs/AUTOMATION.md`.

## 1.0.0 - 2026-08-07

Initial release.

- **Reforged Class Features** compendium with 255 items across 23 classes
  (Basic: 4, Demihuman: 9, Advanced: 9, New: 1 Sage).
- Each class folder mixes standard (unmodified) OSE abilities, APO-modified
  abilities, and new APO abilities, each tagged with
  `flags.ose-apo-reforged-rules.origin`.
- Sage class authored from OSE_NEW_CONTENT.md (Precise Strikes, Sage Skills,
  Broad Knowledge, Erudite Sense, Keen Observation, Medical Prowess, Research,
  Workshop, Savant).
- Generated from the houserules sources: regenerate with
  `scripts/generate_packs.py` + `scripts/build_pack.mjs`.
