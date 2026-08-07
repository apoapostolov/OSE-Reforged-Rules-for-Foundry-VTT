# OSE Reforged Rules - Developer Documentation

Internal documentation for maintainers and contributors working on this
module. It covers what is implemented, how the automation is structured,
and what remains to be built (Tier 2 and beyond).

For the user-facing view, see [AUTOMATION.md](AUTOMATION.md). For the raw
Foundry v14 + OSE API notes (hooks catalog, chat message internals, AE
change dispatch, sheet extension points, dice pipeline), see
[FULL_AUTOMATION_BLUEPRINT.md](FULL_AUTOMATION_BLUEPRINT.md).

## Repository layout

```
scripts/
  generate_packs.py        pack source of truth (items, AEs, metadata)
  build_pack.mjs           LevelDB pack builder (consumes the manifest)
  automation/              runtime layer (v1.2.0+)
    main.js                entry point: settings, prototype patches, hooks
    constants.js           feature name map, finesse list, reroll save map
    helpers.js             feature detection, button builder, usage trackers
    chat-cards.js          renderChatMessageHTML: card buttons + rule tags
    roll-patches.js        OseActor#rollAttack / applyDamage / rollCheck wraps
    actor-hooks.js         preUpdateActor / updateActor: immunity, Grim Tenacity
    sheet-buttons.js       renderActorSheet: header toggles and roll buttons
styles/
  automation.css           OSE-palette styling, data-rf-tooltip bubbles
packs/reforged-class-features/   generated LevelDB (never hand-edited)
docs/
  AUTOMATION.md            user guide (per-class automation tables)
  DEVELOPMENT.md           this file
  FULL_AUTOMATION_BLUEPRINT.md   API notes and feature map
  house-rules/             the Reforged ruleset source
```

## What is implemented

### Layer 1: Active Effects (v1.1.0, 4 effects)

Items carrying an embedded Active Effect with `transfer: true` and
`phase: "initial"`. Applied automatically when the item is placed on an
actor. Defined in `scripts/generate_packs.py` (AES dict).

| Item | Change key | Value |
| --- | --- | --- |
| Halfling Stout Heart | `system.saves.spell.value` | add -2 |
| Halfling Missile Attack Bonus | `system.thac0.mod.missile` | add 1 |
| Halfling Initiative Bonus | `system.initiative.mod` | add 1 |
| Svirfneblin Illusion Resistance | `system.saves.spell.value` | add -2 |

Rules for adding AEs:

- Only numeric fields OSE's derived data reads after the initial phase
  (saves, thac0 mods, initiative mod, AC mods, movement). `phase:
  "initial"` is mandatory.
- Conditional mechanics (extra attacks, target-conditional bonuses,
  once-per-day rerolls) must NOT be static AEs. They go in the runtime
  layer (Layer 3) or stay descriptive.
- OSE sheets render no Effects tab, so toggled AEs have no native UI. Use
  sheet header buttons instead.

### Layer 2: Roll/save metadata (v1.1.0, 84 items)

Metadata on the ability items, following the official OSE module pattern.
Defined in the META dict of `scripts/generate_packs.py`:

- `roll` + `rollType` (`below`/`above`/`result`) + `rollTarget`: the dice
  mechanic, rollable from the sheet via the dice icon.
- `blindroll`: secret GM checks roll privately.
- `save`: abilities that trigger a save roll (e.g. Grim Tenacity = death,
  Stunning Flourish = spell, Sure-Footed = breath).

Counts: 84 items carry real metadata (percentile skills, X-in-6 checks,
save triggers, result rolls). 255 items total in the pack.

### Layer 3: Runtime automation (v1.2.0, scripts/automation/)

Feature-detected: an actor's items are scanned for the Reforged ability
names (constants.js FEATURES map). No configuration needed; the
`automationEnabled` setting (world scope, default true) disables the whole
layer.

#### Chat-card buttons (chat-cards.js)

`renderChatMessageHTML` hook. Card-type detection is DOM-based because
`Roll#toJSON` does not serialize the roll `data` field:

- Attack cards: `flags.ose.roll === "attack"` or `.chat-target` +
  `.ose.chat-block` present; success = `.damage-roll` present.
- Save cards: title matches `Save$`, `.roll-result` has `roll-fail` or
  `roll-success`.

Buttons live in a `.rf-card-buttons` container, deliberately NOT
`.card-buttons` (OSE's own delegated listener routes `.card-buttons
button` clicks into `OseItem._onChatCardAction`, which has no case for
module actions).

| Button | Feature | Rules |
| --- | --- | --- |
| Cleave | Fighter | Successful melee hit; rolls a new melee attack |
| Dodge (dX) | Acrobat | d4/d6/d8/d10 by level; once per round (in-memory, cleared on combat hooks) |
| Reroll | Lucky / Stout Fortune / Iron Will / Acrobat Evasion | Failed save; once per day (actor flag `used.<key>` = worldTime day); save categories from REROLL_SAVE_MAP |

#### Roll pipeline wrappers (roll-patches.js)

Prototype wraps on `OseActor` (the stable seam; OSE's `OseDice.Roll` is
shared with saves/morale and must not be wrapped). Synchronous mutation +
restore in `finally` before the original call; roll formulas are assembled
in the synchronous prologue of `rollAttack`, so the restore happens before
any await.

OSE pushes MELEE attack mods (`str.mod`, `thac0.mod.melee`) into the
DAMAGE parts too. Consequence: attack-only bonuses must compensate the
damage leak on the damage formula; both-sides bonuses ride the leak
naturally. See the header comment in roll-patches.js for the full model.

| Feature | Mechanism |
| --- | --- |
| Attack Giant Foes (Dwarf) | +2 thac0.mod.melee/missile vs giants |
| Harm Giant Foes (Duergar) | +2 on item damage formula vs giants |
| Precise Strikes (Sage) | INT mod to attack (thac0) and damage (formula) |
| Finesse (Drow/Elf/Half-Elf) | swap scores.str.mod for dex.mod (melee) |
| Underfoot Defense (Halfling) | large attacker -1 (thac0.melee, or bba for monster "attack" type) |
| Damage Reduction (Barbarian) | applyDamage wrap: DR 1 (2 at 9th), min 1 |
| Faith's Influence (Cleric) | rollCheck wrap: +1 target on WIS/CHA when toggle active |

Giant detection (`isGiant`): OSE monsters have no size field, so giant =
monster with a matching name (`giant|ogre|troll|ettin|cyclops|golem|
hydra`) or HD >= 8.

#### Actor hooks (actor-hooks.js)

- Sleep/Paralysis Immunity (Drow/Elf/Half-Elf): `preUpdateActor` strips
  sleep/paralysis/unconscious from `changes.statuses` and
  `changes["system.statuses"]`, posts a notice card. DOM-built card
  (actor name is user input; never innerHTML it).
- Grim Tenacity (Half-Orc): `updateActor` watches `system.hp.value`;
  when it hits 0 and not used today, posts a card with a save-vs-Death
  button. On click: marks used, calls `rollSave("death", {fastForward:
  true})`.

#### Sheet header toggles (sheet-buttons.js)

`renderActorSheet` appends a `.rf-toggle-row` to `.header-details`.
Toggles write `flags.<module>.fleetActive / faithActive / shieldActive`;
roll buttons call their action directly.

| Button | Feature | Side effect |
| --- | --- | --- |
| 🏃 Fleet in Terrain | Ranger | flag only (speed is GM-adjusted) |
| ⚖️ Faith's Influence | Cleric | flag; rollCheck wrapper reads it |
| 🛡️ Shield Stand | Knight | flag; ac.mod/aac.mod +1 while on |
| 👁️ Battle Senses | Barbarian | rolls save vs Death |

#### Styling (styles/automation.css)

Uses the OSE palette (`#4b4a44` ink, `#f5f5f5` paper, `#aa0200` fail,
`#18520b` success) and OSE chat-card classes. Custom tooltips use the
namespaced `data-rf-tooltip` attribute because Foundry's core
TooltipManager owns `data-tooltip`.

#### Usage tracking

- Per-day: actor flags (`flags.<module>.used.<key>` = `game.time
  .worldTime` day). Used for rerolls and Grim Tenacity.
- Per-round: in-memory Map cleared on combat hooks (combatRound,
  combatStart, combatEnd, deleteCombat). Used for Dodge Die.

## What remains (Tier 2 and beyond)

The blueprint maps every Reforged feature to a mechanism. Tier 1 is
implemented. The rest is open work, in rough priority order.

### Tier 2: needs more infrastructure

| Feature | Mechanism | Notes |
| --- | --- | --- |
| Paladin Smite Evil (natural 19/20 max damage) | attack-result hook | Needs OSE's attack success math exposed to a hook; currently the natural-1/20 detection lives inside `attackIsSuccess` |
| Ranger Enemy Slayer (full) | rollAttack wrapper + target awareness | Sheet save trigger exists; +4 hit / double damage needs unaware-target state |
| Drow Dark Assassination (+4 atk in darkness) | combat state check | Needs a darkness/unawareness state; no such flag exists in OSE |
| Sage Keen Observation (targeted bonus) | targetToken hook + temporary AE | Grants a temp AE to a targeted token |
| Bard Battle Songs | macro-based toggle | Morale affects monsters only; no ally-morale field in OSE |
| Paladin Dedication (conditional atk/dmg) | rollAttack wrapper + alignment check | Needs target alignment in the roll path |

### Tier 3: heavier infrastructure

Not yet scoped in detail. Candidates:

- Combat-scene control buttons for GM features (surprise rounds, terrain
  toggles) via `getSceneControlButtons`.
- Custom change types registered in `CONFIG.ActiveEffect.changeTypes` for
  computed effects (level-scaled DR, cleave counters).
- A per-feature settings panel (currently one master toggle) so GMs can
  disable individual automations.
- Token-based state tracking (darkness, awareness, surprise) as a
  prerequisite for the Tier 2 target-aware features.

### Tier 4: GM judgment

Features that will likely stay descriptive because honest automation would
require reading the fiction: social interactions, faction reputation,
environmental rulings, most downtime activities.

## How to add a new automated feature

1. Find the feature in the pack manifest (or add the item in
   `scripts/generate_packs.py` first).
2. Decide the layer:
   - Static numeric bonus -> AE (Layer 1).
   - Dice mechanic -> roll metadata (Layer 2).
   - Conditional/event-driven -> runtime (Layer 3).
3. For Layer 3, pick the seam:
   - Chat decision -> renderChatMessageHTML button (chat-cards.js).
   - Roll-time bonus -> rollAttack/rollDamage wrapper (roll-patches.js).
   - Pre-damage effect -> applyDamage wrapper.
   - Actor state change -> preUpdateActor/updateActor hook.
   - Player toggle -> sheet header button (sheet-buttons.js).
4. Add the feature name to constants.js FEATURES if not present.
5. Register any per-day/per-round usage in helpers.js.
6. Add the button/toggle entry to the user guide (AUTOMATION.md) and this
   file's implemented list.
7. Rebuild packs if items changed: `python3 scripts/generate_packs.py` +
   `node scripts/build_pack.mjs packs/reforged-class-features`.

## Verification checklist

After any change:

- [ ] `node --check` on every touched .js file
- [ ] No unused imports across the automation modules
- [ ] Packs rebuild with stable counts: 255 items, 4 AEs, 84 metadata
- [ ] User guide (AUTOMATION.md) and changelog updated
- [ ] Live module dir synced to git-public (rsync/cp, then commit)
- [ ] markdownlint clean on touched .md files

## Known limitations and guardrails

- OSE uses v1 ActorSheet (jQuery). Sheet extensions must not break v1
  patterns.
- Monsters use `CONFIG.OSE.monster_saves` by HD; character save fields
  are meaningless on monsters. Do not put character-save AEs on monsters.
- Never wrap `OseDice.Roll` directly (shared by saves, morale, checks).
  Wrap the specific `OseActor` method instead.
- OSE sheets render no Effects tab. Any toggled effect needs a custom UI.
- The `data-rf-tooltip` attribute is namespaced on purpose: Foundry core
  owns `data-tooltip`.
- User-controlled strings (actor names) must go through `textContent` /
  DOM building, never innerHTML interpolation.
- The module title in module.json contains a typo ("Old-School
  Eessentials") inherited from the combat-module template. Kept as-is
  pending Apo's word; changing it affects installed-module identity.
