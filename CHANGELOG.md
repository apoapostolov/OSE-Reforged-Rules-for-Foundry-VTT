# CHANGELOG

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
