# OSE Reforged Rules - Macro Automation

Macro-based automation is the third automation path of this module, after
Active Effects (static bonuses) and the runtime layer (hooks + chat buttons).
Macros add a player-facing trigger to features that need a decision, without
requiring the module to guess what the player is doing.

This document explains the architecture, what the ecosystem proves is
possible, and the macro inventory. Research sources and deep dives live in
the private knowledge hub; this page is the actionable contract.

## The core idea: macro sets state, module enforces it

A script macro is an async JavaScript function executed in the client. It
gets `speaker, actor, token, character, scope` injected, and it can read and
write actor flags, post chat messages, show dialogs, and roll dice. But a
macro is a one-shot: anything it sets up must survive after the macro
returns.

The pattern that works (proven by the whole macro ecosystem, from OSR
helpers to PF2e charge-analogs):

1. The **macro** is the UI: it checks state, sets a flag, posts the
   announcement, and returns.
2. The **module** is the enforcement: its existing hooks and wrappers read
   the flag, apply the effect to the roll, consume the flag, and post the
   follow-up messages.
3. **State lives in actor flags** (`actor.setFlag`), which persist, sync to
   the database, and survive reloads. Never mutate actor data directly
   without an `update` call, and never use module globals for state that
   must survive.

Why not register hooks from inside a macro? A macro's `Hooks.on` registrations
live only for the current client session and vanish on page reload. The
module's own scripts re-register hooks on every load, so enforcement always
lives in module code. This is the universal practice across the ecosystem
(the Hook Macros and Macro Monkey modules exist precisely to re-wire
macro-to-hook bindings from settings on every load).

## What the ecosystem proves is possible

Research across ~50 installed macro compendiums (PF2e, OSR, d100-family,
Delta Green) plus the community repos confirms these capabilities, each
with real implementations:

| Capability | Proven by | How |
|---|---|---|
| Modify the next attack roll, then vanish | PF2e Aid effects (`removeAfterRoll: true`); PF2e-ranged-combat FakeOut | Set flag/effect, consume in the attack wrapper, clear it |
| Set state, read it later, clear it | Every charge-analog in the ecosystem | Flag written by macro, read by module hook on the next roll |
| Reset on kill / round / encounter / dawn | pf2e-ranged-combat, pf2e-bard-helper, osr-helper | `updateActor` HP=0 hook, `combatRound`, `deleteCombat`, `game.time` |
| Announce in chat with a styled card | pf2e-ranged-combat chat.js, osr-helper | `ChatMessage.create` with `style`, `flavor`, `content` |
| Prompt the player before acting | DialogV2 (v13+), community macros | `DialogV2.confirm / prompt / input`, awaitable |
| Attach a macro to a specific item | itemacro (OSE supported natively) | `item.setMacro`, `item.executeMacro`; click the item image |
| Parameterize one macro for many uses | advanced-macros (core absorbed args in v13) | `macro.execute({key: value})`, `/macro Name key=val` |
| Run a macro as GM / for everyone | advanced-macros | `runForSpecificUser` flag routing via socketlib |
| Trigger on hooks (session-scoped) | osr-helper `updateCombat`, Macro Monkey | `Hooks.on` inside macro or module |
| Mass-edit party state | wfrp4e-gm-toolkit, osr-character-builder | Iterate `game.actors`, `actor.update` batch |
| Token/status manipulation | Core `toggleStatusEffect`, community status macros | `actor.toggleStatusEffect(id)`, `actor.update({statuses})` |
| Summon / transform tokens | warpgate, Foundry Summons | `warpgate.spawnAt / mutate / revert` |
| GM-side rolls with hidden results | Delta Green automation, recall-knowledge | Blind rolls, whisper to GM |

Two honest limits from the research:

- **No reload-proof macro hooks.** A macro cannot install a hook that
  survives F5. If a feature needs persistent interception, the module owns
  the hook; the macro only feeds it state.
- **No reading the fiction.** Awareness, darkness, surprise, and intent
  have no game-state representation. Macros cannot fix that; they can only
  let the player declare the state (click "unaware", toggle "darkness").

## Macro inventory

Macros ship as source files in `scripts/automation/macros/`. Each is a
copy-paste script macro or (future) a macro compendium pack. The module's
runtime provides the enforcement half via `game.<moduleId>` helpers.

### Charge Fury (Barbarian) - implemented prototype

The reference implementation of the macro-sets-state pattern.

**Macro** (`scripts/automation/macros/charge-fury.js`):

1. Resolves the actor (controlled token, then user character).
2. Guards: refuses if `chargeSpent` (must kill to re-arm) or if already
   `chargeActive`.
3. Sets `flags.ose-apo-reforged-rules.chargeActive` to the current round.
4. Posts the "⚡ Charge Fury" announcement card (DOM-built, no HTML
   injection).

**Module enforcement** (`roll-patches.js`, `actor-hooks.js`,
`chat-cards.js`):

1. On the NEXT melee attack, the `rollAttack` wrapper sees `chargeActive`,
   clears it, sets `chargeSpent`, and bumps `thac0.mod.melee` by 2. OSE's
   melee math (attack mods ride both roll parts and damage parts) yields
   exactly +2 to hit and +2+STR to damage, per the rule.
2. The wrapper posts the "charge finished" card: the barbarian is spent
   until a kill.
3. `chat-cards.js` records melee hits by charge-capable barbarians
   (victim uuid from the attack card).
4. `actor-hooks.js` watches HP: when a recorded victim drops to 0, the
   barbarian's `chargeSpent` is cleared and a "may charge again" card is
   posted.

**The feel:** click the macro, the announcement posts. Attack. The charge
is consumed with a message. Drop an enemy, and the module tells you the
barbarian can charge again. The exhausted state lives on the actor, so it
survives reloads and is visible to the player's own macro guard.

## Roadmap: features that become automatable via macros

The TODO list features that were "stuck" on missing state now have a
macro-shaped path:

| Feature | Macro trigger | Module enforcement | State |
|---|---|---|---|
| Barbarian Charge Fury | Charge macro (implemented) | rollAttack wrapper + HP=0 reset | `chargeActive`, `chargeSpent` flags |
| Paladin Smite Evil | Smite macro: declares the smite | rollAttack wrapper detects natural 20/19/18 | `smiteActive` flag, target check |
| Ranger Enemy Slayer | Mark-target macro: "enemy unaware" | rollAttack wrapper adds +4 / double damage | `unaware` flag on target actor |
| Drow Dark Assassination | Darkness + mark-unaware macros | rollAttack wrapper adds +4 or double | scene/actor flags |
| Gnome Blink Away | Blink macro | applyDamage hook + `toggleStatusEffect("invisible")` | once-per-day flag |
| Illusion Savvy | Click-illusion macro | rollCheck wrapper vs illusion dc | none (roll only) |
| Battle Oath (Knight) | Oath macro | combat hook adds taunted-mark, turn timer | combatant flags |
| Half-Orc Stubborn Vitality | (Grim Tenacity card) | HP=0 hook computes reduced CON loss | per-day flag |

Each entry follows the same shape: a thin macro that declares intent and a
module hook that enforces and consumes.

## Delivery model

- **Today:** macros ship as documented source files the GM pastes into a
  Macro and drags to the hotbar. Zero dependencies.
- **Optional:** ship a Macro compendium pack in the module so macros are
  drag-and-drop from the compendium sidebar.
- **Optional:** itemacro integration - attach macros to the ability items
  themselves so clicking the ability runs the macro. itemacro supports OSE
  natively; the module stays compatible by exposing `game.ose-reforged.*`
  helpers the item macros call.
- **Never:** module code depends on a macro being present. The module's
  enforcement hooks are inert without the trigger, so a world without the
  macros still works.

## Guardrails

- Macros must build chat content with DOM APIs (`document.createElement`)
  or escape actor names. Actor names are user input; interpolating them
  into HTML is an injection vector.
- Module state must use `actor.setFlag` / `getFlag` / `unsetFlag`, never
  direct flag mutation.
- Reset cadences must have a hook: `updateActor` for kills, `combatRound`
  for rounds, `deleteCombat` for encounter cleanup, `game.time` for
  dungeon turns.
- Macros should be thin. Logic belongs in module code so it can be tested
  and versioned.
