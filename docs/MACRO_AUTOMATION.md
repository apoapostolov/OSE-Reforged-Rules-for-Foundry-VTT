# OSE Reforged Rules - Macro Automation

Macro-based automation is the third automation path of this module, after
Active Effects (static bonuses) and the runtime layer (hooks + chat buttons).
Macros add a player-facing trigger to features that need a decision, without
requiring the module to guess what the player is doing.

This document explains the architecture and the macro inventory. It is the
actionable contract for macro-based automation in this module.

## The core idea: macro sets state, module enforces it

A script macro is an async JavaScript function executed in the client. It
gets `speaker, actor, token, character, scope` injected, and it can read and
write actor flags, post chat messages, show dialogs, and roll dice. But a
macro is a one-shot: anything it sets up must survive after the macro
returns.

The pattern that works:

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
lives in module code.

## What macros can do

| Capability | How |
|---|---|
| Modify the next attack roll, then vanish | Set flag/effect, consume in the attack wrapper, clear it |
| Set state, read it later, clear it | Flag written by macro, read by module hook on the next roll |
| Reset on kill / round / encounter / dawn | `updateActor` HP=0 hook, `combatRound`, `deleteCombat`, `game.time` |
| Announce in chat with a styled card | `ChatMessage.create` with `style`, `flavor`, `content` |
| Prompt the player before acting | `DialogV2.confirm / prompt / input`, awaitable |
| Attach a macro to a specific item | `item.setMacro`, `item.executeMacro`; click the item image |
| Parameterize one macro for many uses | `macro.execute({key: value})`, `/macro Name key=val` |
| Run a macro as GM / for everyone | Socket-based routing (`socketlib` or core) |
| Trigger on hooks (session-scoped) | `Hooks.on` inside macro or module |
| Mass-edit party state | Iterate `game.actors`, `actor.update` batch |
| Token/status manipulation | `actor.toggleStatusEffect(id)`, `actor.update({statuses})` |
| Summon / transform tokens | `warpgate.spawnAt / mutate / revert` |
| GM-side rolls with hidden results | Blind rolls, whisper to GM |

Two honest limits:

- **No reload-proof macro hooks.** A macro cannot install a hook that
  survives F5. If a feature needs persistent interception, the module owns
  the hook; the macro only feeds it state.
- **No reading the fiction.** Awareness, darkness, surprise, and intent
  have no game-state representation. Macros cannot fix that; they can only
  let the player declare the state (click "unaware", toggle "darkness").

## Macro inventory

Macros ship as source files in `scripts/automation/macros/`, and in the
**Reforged Macros** compendium pack. Each is a
copy-paste script macro. The module's
runtime provides the enforcement half via `game.<moduleId>` helpers.

### Charge Fury (Barbarian) - implemented prototype

The reference implementation of the macro-sets-state pattern.

**Macro** (`scripts/automation/macros/charge-fury-macro.js`, shipped in
the **Reforged Macros** compendium pack):

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

## The tag-toggle pattern (secondary approach)

A second macro architecture, complementary to state-flags: instead of the
player declaring intent, the GM declares a persistent property of a
creature, and the system reads it on ordinary rolls.

**Cleanse Evil (Paladin) - implemented prototype:**

The Paladin rules (Dedication to Law & Good, Smite Evil) key off
"inherently evil creatures", but OSE's monster data model has no alignment
field. The tag-toggle supplies that state:

1. **GM macro** (`scripts/automation/macros/cleanse-evil-tag-macro.js`,
   shipped in the **Reforged Macros** compendium pack with a holy-sword
   core icon): the DM targets a vampire (or demon, cultist...) and runs
   the macro. It toggles
   `flags.ose-apo-reforged-rules.evil` on the target actor and whispers the
   result to the GM. The tag is hidden metadata, invisible to players, and
   survives reloads.
2. **Paladin's normal attack** (no Paladin macro): the module's
   `rollAttack` wrapper detects the Dedication feature (item present),
   reads the target's evil flag, and applies the bonuses: +1 to hit vs
   evil creatures with HD >= the paladin's level, +2 damage vs evil
   creatures with HD < the paladin's level. HD is parsed from the monster
   dice string ("2d6" -> 2).

**Why the tag must be a flag, not a condition:** Apo's two-way design
distinction. Conditions (status icons) are simple and visible, but public:
players can see the mark. The hidden metadata flag is required when the DM
knows the vampire is evil and the players do not yet. The macro supports
both modes (a `USE_HIDDEN_FLAG` switch) so the GM picks per use.

**The feel:** the DM marks the vampire before the fight. The Paladin just
rolls attacks as always - the module adds +1/+2 automatically on tagged
creatures, and the players never see why.

## Roadmap: features that become automatable via macros

The TODO list features that were "stuck" on missing state now have a
macro-shaped path:

| Feature | Macro trigger | Module enforcement | State |
|---|---|---|---|
| Barbarian Charge Fury | Charge macro (implemented) | rollAttack wrapper + HP=0 reset | `chargeActive`, `chargeSpent` flags |
| Paladin Cleanse Evil / Dedication | GM tag macro (implemented) | rollAttack wrapper reads target evil flag | `evil` flag on target actor |
| Paladin Smite Evil | GM tag macro (same tag) | rollAttack wrapper: natural 20/19/18 vs tagged target -> max + extra roll | `evil` flag on target actor |
| Ranger Enemy Slayer | Mark-target macro: "enemy unaware" | rollAttack wrapper adds +4 / double damage | `unaware` flag on target actor |
| Drow Dark Assassination | Darkness + mark-unaware macros | rollAttack wrapper adds +4 or double | scene/actor flags |
| Gnome Blink Away | Blink macro | applyDamage hook + `toggleStatusEffect("invisible")` | once-per-day flag |
| Illusion Savvy | Click-illusion macro | rollCheck wrapper vs illusion dc | none (roll only) |
| Battle Oath (Knight) | Oath macro | combat hook adds taunted-mark, turn timer | combatant flags |
| Half-Orc Stubborn Vitality | (Grim Tenacity card) | HP=0 hook computes reduced CON loss | per-day flag |

**Tier 2 features that benefit from the tag-toggle approach** (secondary
method, beyond player-trigger macros):

| Feature | Tag needed | Why the tag unlocks it |
|---|---|---|
| Smite Evil (Paladin) | `evil` on target | Natural-20/19/18 detection needs the "inherently evil" qualifier; rides the Cleanse Evil tag with zero extra GM work |
| Sanctified Sense (Paladin) | `evil` on targets | A "sense" macro (or combat-start hook) lists all tagged creatures within 60' - no alignment field needed |
| Turn Undead (Cleric) | `undead` on target | The 2d6 table keys off undead type; a GM tag supplies it for custom undead that OSE does not classify |
| Divert the Wicked (Paladin) | `evil` on target | Taunt targeting needs the evil qualifier to know what the paladin can divert |
| Holy Resistance (Paladin) | `evil` on attacker | Damage-reduction hook triggers when the ATTACKER is tagged evil (mirror: GM tags the attacker, not the victim) |
| Any "holy/dark" damage vs creature type | `evil` / `undead` / `demon` | GM-declared creature properties replace missing monster data across all systems |

The tag-toggle converts "creature property" features from unmappable to
automatable: the GM declares the property once, and every feature keyed on
it reads the same flag. This is the pattern's leverage - one tag, many
consumers.

Each entry follows the same shape: a thin macro that declares intent and a
module hook that enforces and consumes.

## Delivery model

- **Compendium pack (shipped):** the module ships a **Reforged Macros**
  Macro compendium pack (`packs/reforged-macros`, declared in module.json).
  GMs drag macros from the compendium to the hotbar; each macro carries a
  general-audience header comment (how to use, what it needs, what you
  see, troubleshooting) and a themed core icon. Rebuild with
  `node scripts/build_macros_pack.mjs packs/reforged-macros` after
  editing any source file in `scripts/automation/macros/`.
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
