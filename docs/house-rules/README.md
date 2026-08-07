# House Rules (source of truth)

These are the Reforged house rules that power this module. The compendium
items and every automation effect in this repo are generated from these
documents, so when you read an ability in Foundry, the full rule text lives
here.

| Document | Contents |
|---|---|
| [OSE_HOUSE_RULES.md](OSE_HOUSE_RULES.md) | The full Reforged ruleset: campaign start, class rework for all Basic, Demihuman, and Advanced classes, combat, damage, skills, hirelings, environment, level up, and downtime. Version 1.3.5. |
| [OSE_NEW_CONTENT.md](OSE_NEW_CONTENT.md) | The new Sage class plus other original content not in the standard rules. |
| [CHANGELOG.md](CHANGELOG.md) | Version history of the house rules (SemVer). |
| [TORCH_REALISM_SLAVIC.md](TORCH_REALISM_SLAVIC.md) | Optional Feudal Slavic lighting subsystem: torch types, quality, and cost. |
| [D&D_DESCRIPTORS.md](D&D_DESCRIPTORS.md) | Ability score descriptions for character creation and roleplay. |

## How the module relates to these rules

- **Class feature items** in the `Reforged Class Features` compendium pack
  are built from the class sections of `OSE_HOUSE_RULES.md` and
  `OSE_NEW_CONTENT.md`.
- **Automated effects** (active effects, roll metadata, chat-card buttons,
  roll bonuses, sheet toggles) implement the mechanical parts of these rules
  inside Foundry. See [../AUTOMATION.md](../AUTOMATION.md) for the full
  technical breakdown.
- Where a rule cannot be automated honestly (judgment calls, table-level
  effects, free-form situations), the module leaves it descriptive and the
  GM applies it by hand. The docs explain why for each case.

## What is not included here

The following documents exist in the author's private source folder but are
deliberately not published in this repo:

- **`MASTER_STATBLOCK_PROMPT.md`** - internal tooling prompt for the OSE
  statblock generator.
- **`CLASS_ANALYSIS.md`**, **`FEEDBACK.md`**, **`TODO.md`**,
  **`USER_STYLE.md`** - internal management and design notes, not player
  rules.
- The converted **OSE Advanced Fantasy Player's Tome** text - the official
  Necrotic Gnome rulebook is copyrighted and not distributable here.

## Note on versioning

The module version (e.g. 14.2.1; MAJOR = Foundry VTT version) tracks module releases. The house rules
version (1.3.5) tracks rules changes. They are independent.
