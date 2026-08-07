# OSE Reforged Rules — Automation Documentation

This document explains every piece of automation in the Reforged Class
Features compendium: what is automated, how it works, what you see when you
use it, and where it affects the OSE system.

It is written for two audiences:

- **Players and GMs** who use the module and want to know what happens when
  they drag an ability onto a character.
- **Developers and AI agents** who maintain the module and need the technical
  details (data paths, schemas, regeneration rules).

Version covered: **1.1.0** (2026-08-07).

For the full Foundry v14 + OSE system API research (hooks catalog, chat
message injection, sheet extension points, damage/save/attack pipeline,
and the feature-by-feature automation map), see
**[FULL_AUTOMATION_BLUEPRINT.md](FULL_AUTOMATION_BLUEPRINT.md)**.

---

## 1. Design Philosophy

The official OSE Advanced Fantasy module ships **zero Active Effects**. All of
its 240 items are descriptive text plus roll metadata. When a passive bonus
exists (for example the Halfling's +1 missile attack), the official module
tells the player to click the Tweaks button and type the number in by hand.

This module follows the same base pattern, then goes one step further:

- **Roll and save metadata** is assigned exactly like the official module.
  Any ability with a dice mechanic (X-in-6, percentile, or a triggered save)
  carries the metadata the OSE system needs to roll it from the sheet.
- **Active Effects** are added only where the OSE data model can express a
  passive numeric bonus honestly. Four abilities qualify. Everything else is
  conditional or event-driven and would be wrong as an always-on effect.

Why so few AEs? The OSE actor data model exposes a small set of numeric
fields: saves, attack modifiers, AC modifiers, movement, initiative, ability
scores. Features like "extra attack on a kill" or "+2 vs giants" cannot be
expressed as static value changes. Encoding them as always-on AEs would
create wrong rules. They stay descriptive, exactly as the official module
treats the same kind of feature.

---

## 2. Active Effects Implemented

Four items carry an embedded Active Effect with `transfer: true`. When the
item is placed on an actor (dragged from the compendium), the effect
transfers to the actor and applies. The change is active immediately; there
is no toggle step.

All changes use Foundry v14 schema: `system.changes[]` with
`{key, type: "add", value, phase: "initial"}`. The `initial` phase is what
feeds into OSE's derived data (saves, AC, movement are recalculated after
the initial phase runs).

### 2.1 Stout Heart (Halfling, new feature)

| Field | Value |
|---|---|
| Change key | `system.saves.spell.value` |
| Change type | `add` |
| Change value | `-2` |
| Transfer | `true` |
| Disabled | `false` |

**What the rule says:** +2 to saving throws versus magical effects that
charm, dominate, possess, or compel action against the Halfling's nature.
Stacks with racial save bonuses.

**How it works:** OSE saves are target numbers. You roll 1d20 and must roll
at or above the target. A bonus to saves lowers the target. Adding `-2` to
the spell save value is a +2 save bonus. Charm, dominate, possess, and
compel effects are spell saves in OSE, so the whole category is the correct
target.

**What the player sees:** On the character sheet, the Spell save value is 2
lower than the class baseline. For example, a Halfling with a base spell
save of 13 shows 11.

**What the GM sees:** The same lower value on the actor sheet. When the
Halfling rolls a save versus a charm or domination effect, the system rolls
against the lowered target automatically.

**Where it affects functionality:** The character sheet Saves section and
every save roll versus spells (`rollSave` reads `system.saves.spell.value`).

### 2.2 Missile Attack Bonus (Halfling, official item automated)

| Field | Value |
|---|---|
| Change key | `system.thac0.mod.missile` |
| Change type | `add` |
| Change value | `1` |
| Transfer | `true` |
| Disabled | `false` |

**What the rule says:** +1 to attack rolls with all missile weapons.

**How it works:** OSE attack rolls for missile weapons add the missile
attack modifier to the d20 result. The official module tells the player to
enter 1 into the Missile Bonus field through Tweaks. This AE does that
automatically.

**What the player sees:** Missile attack rolls include an extra +1. The
attack card shows the modifier in the roll breakdown.

**What the GM sees:** The same +1 on the Halfling's missile attack rolls.

**Where it affects functionality:** Every missile attack roll
(`rollAttack` with type `missile` adds `system.thac0.mod.missile`).

### 2.3 Initiative Bonus (Halfling, official optional-rule item automated)

| Field | Value |
|---|---|
| Change key | `system.initiative.mod` |
| Change type | `add` |
| Change value | `1` |
| Transfer | `true` |
| Disabled | `false` |

**What the rule says:** +1 to initiative rolls (optional individual
initiative rule).

**How it works:** The OSE initiative value is the sum of the initiative
value, the initiative modifier, and the Dexterity initiative bonus. Adding 1
to the modifier shifts initiative by +1.

**What the player sees:** +1 appears in the initiative value on the combat
tracker.

**What the GM sees:** The same +1 when combat order is rolled.

**Where it affects functionality:** Combat tracker initiative (`get init()`
reads `system.initiative.mod`).

### 2.4 Illusion Resistance (Svirfneblin, official item automated)

| Field | Value |
|---|---|
| Change key | `system.saves.spell.value` |
| Change type | `add` |
| Change value | `-2` |
| Transfer | `true` |
| Disabled | `false` |

**What the rule says:** +2 bonus to all saving throws against illusions.

**How it works:** Same mechanism as Stout Heart. Illusion saves are spell
saves in OSE, so the spell save target drops by 2.

**What the player sees:** The Spell save value is 2 lower than the class
baseline.

**What the GM sees:** The same lowered value on the actor sheet.

**Where it affects functionality:** Character sheet Saves section and all
save rolls versus spells.

---

## 3. Roll and Save Metadata

84 items carry OSE roll metadata. This is the same mechanism the official
module uses. It makes the ability rollable from the character sheet and
shows the correct tags.

### 3.1 The metadata fields

| Field | Meaning |
|---|---|
| `roll` | The dice formula, for example `1d6`, `1d100`, `1d3` |
| `rollType` | How success is judged: `below`, `above`, or `result` |
| `rollTarget` | The target number for `below` / `above` rolls |
| `blindroll` | `true` means the roll is secret (GM-only result) |
| `save` | The save category the ability triggers: `death`, `wand`, `paralysis`, `breath`, `spell` |

**What the player sees:** Ability names become clickable when they have a
roll formula. Clicking rolls the dice and shows the result versus the
target. The item summary shows auto-generated tags: `Roll 1d6 ≤ 4`, `Save:
Spell`, and so on.

**What the GM sees:** For `blindroll` abilities (secret checks like
listening, hiding, or detecting), the roll is made in secret and only the
GM sees the result. Save tags show the skull icon.

**What the player does not see:** The underlying metadata. It is invisible
until the ability is used.

### 3.2 House-rule values assigned

The Reforged rules rework the Thief skill progression and related
percentile skills. The roll targets reflect the house-rule level 1 values:

| Item | Roll | Target | Blind |
|---|---|---|---|
| Open Locks (OL) | 1d100 below | 10 | no |
| Climb sheer surfaces (CS) | 1d100 below | 25 | no |
| Hear noise (HN) | 1d6 below | 1 | yes |
| Hide In Shadows (HS) | 1d100 below | 10 | yes |
| Move silently (MS) | 1d100 below | 10 | yes |
| Pick Pockets (PP) | 1d100 below | 10 | no |
| Find/remove treasure traps (TR) | 1d100 below | 10 | yes |
| Acrobat CS | 1d100 below | 40 | no |
| Acrobat TW | 1d100 below | 40 | yes |
| Acrobat FA | 1d100 below | 25 | no |
| Barbarian CS | 1d100 below | 25 | no |
| Assassin CS | 1d100 below | 25 | no |

### 3.3 X-in-6 checks on new features

| Item | Roll | Target | Blind |
|---|---|---|---|
| Cure Disease (Ritual) | 1d6 below | 4 | no |
| Terrain Hiding (Gnome) | 1d6 below | 4 | yes |
| Terrain Hiding (Halfling) | 1d6 below | 5 | yes |
| See Through Pretense | 1d6 below | 1 | yes |
| Stone Camouflage | 1d6 below | 4 | yes |
| Bardic Knowledge | 1d6 below | 1 | yes |
| Antivenom Craft | 1d6 below | 5 | no |
| Minor Conjurations | 1d6 below | 3 | yes |
| Clean of Body | 1d6 below | 2 | no |

### 3.4 Simple result rolls

| Item | Roll |
|---|---|
| Poisoncraft (Spiders) | 1d3 |
| Brutal Grapple | 1d4 |
| Herbal Salves | 1d3 |

### 3.5 Save triggers

| Item | Save |
|---|---|
| Assassination (AS) | death |
| Grim Tenacity | death |
| Battle Senses | death |
| Enemy Slayer | death |
| Stunning Flourish | spell |
| Sure-Footed | breath |

### 3.6 Sage percentile skills

The Sage uses a Thief-style percentile progression. The items carry the
level 1 base values:

| Item | Roll | Target | Blind |
|---|---|---|---|
| Sage Skills | 1d100 below | 25 | no |
| Erudite Sense | 1d100 below | 25 | yes |
| Keen Observation | 1d100 below | 20 | no |
| Medical Prowess | 1d100 below | 20 | no |
| Research (Downtime) | 1d100 below | 25 | yes |
| Workshop (Downtime) | 1d100 below | 10 | no |

---

## 4. What Is Not Automated and Why

These features look automatable but cannot be expressed as honest always-on
Active Effects in the OSE system. They are descriptive text only:

| Feature | Why it is not an AE |
|---|---|
| Fighter Cleave | Extra attack on kill. Needs a combat event hook, not a stat change. |
| Acrobat Dodge Die | Reactive AC bump on being hit. Needs damage-roll interception. |
| Rerolls (Lucky, Stout Fortune, Iron Will) | Once-per-day reroll of a failed roll. Needs a macro and resource tracking. |
| Paladin Smite Evil | Triggers on natural 19/20. Needs an attack-result hook. |
| Dwarf/Duergar giant-foe bonuses | "+2 vs giants" is conditional on the target. OSE AEs cannot filter by target. |
| Barbarian Damage Reduction | OSE has no damage-reduction field in the data model. |
| Sleep/Paralysis Immunity | OSE has no immunity/status system. |
| Finesse variants (Dex for Str) | OSE weapons have no per-weapon ability substitution. |
| Half-Orc Grim Tenacity (the 0 hp part) | Save to stay conscious at 0 hp. Needs an HP-zero hook. |
| Ranger favored-terrain speed | Conditional on terrain. Toggling needs an effects UI OSE does not render. |

If these are wanted as real automation, they need macros or a companion
combat module. The roll/save metadata on several of them (Grim Tenacity,
Battle Senses, Stunning Flourish) already gives the GM the correct dice
roll from the sheet.

---

## 5. Technical Reference

### 5.1 Active Effect schema (Foundry v14)

```json
{
  "name": "Stout Heart",
  "type": "base",
  "img": "icons/svg/aura.svg",
  "system": {
    "changes": [
      {
        "key": "system.saves.spell.value",
        "type": "add",
        "value": "-2",
        "phase": "initial",
        "priority": null
      }
    ]
  },
  "disabled": false,
  "transfer": true,
  "duration": { "value": null, "units": "seconds", "expiry": null, "expired": false },
  "statuses": [],
  "flags": {}
}
```

Notes:

- `phase: "initial"` is required. OSE's derived data (saves, AC, movement)
  is computed after the initial phase. A `final` phase change would be
  overwritten for derived fields.
- `transfer: true` is required for the effect to apply when the item is on
  an actor. OSE does not override core AE application, so the transfer
  works out of the box.
- The OSE sheet has no Effects tab. Effects are invisible in the UI but
  their value changes appear in the affected stats (saves, initiative,
  attack modifiers). This is why disabled/toggle AEs are avoided: there is
  no UI to toggle them.

### 5.2 OSE data paths used

| Path | What it changes |
|---|---|
| `system.saves.spell.value` | Spell save target (lower is better) |
| `system.thac0.mod.missile` | Missile attack modifier |
| `system.initiative.mod` | Initiative modifier |

### 5.3 Verifying an AE is applied

1. Drag the ability onto an actor.
2. Open the actor sheet.
3. Check the affected stat: Spell save 2 lower, missile bonus +1, or
   initiative +1.
4. For save bonuses, roll a save versus spells and confirm the target.

---

## 6. Regeneration

The packs are generated, never hand-edited. To change an effect or
metadata:

1. Edit `scripts/generate_packs.py`:
   - `AES` dict for active effects (keyed by class and item name).
   - `META` dict for roll/save metadata.
2. Run `python3 scripts/generate_packs.py` to write the manifest.
3. Run `node scripts/build_pack.mjs packs/reforged-class-features` to
   rebuild the LevelDB pack.
4. Verify counts: 255 items, 4 with AEs, 84 with roll/save metadata.
5. Bump the version per Apo's rule: PATCH for fixes, MINOR for new
   features.

---

## 7. Summary

| Layer | Count | What it does |
|---|---|---|
| Active Effects | 4 | Passive numeric bonuses applied on item placement |
| Roll metadata | 84 | Rollable abilities with correct targets and blind rolls |
| Save metadata | 6 | Abilities that trigger a save roll |
| Descriptive only | rest | Conditional or event-driven features |
