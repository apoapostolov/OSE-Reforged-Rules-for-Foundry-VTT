# Full Automation Blueprint: OSE Reforged Class Features
## Foundry VTT v14 + OSE System API Reference

Baseline: Foundry VTT 14.359, OSE system 2.3.0+, module ose-apo-reforged-rules
1.1.0. Purpose: document every API surface needed to automate every Reforged
class feature — not just passive AEs, but option buttons on chat messages,
new buttons/tabs on sheets, damage interception, 0-HP hooks, reroll prompts,
conditional attack bonuses, and combat-event logic.

---

## 1. Current state and the automation gap

| Layer | Count | What it covers |
|---|---|---|
| Active Effects (transfer: true) | 4 | Stat bonuses that are always-on passives |
| Roll/save metadata | 84 | Dice-mechanic abilities rollable from sheet |
| Descriptive only (needs code) | ~60 | Conditional, event-driven, interactive |

The "descriptive only" features (Cleave, Dodge Die, rerolls, giant-foe
bonuses, damage reduction, finesse, immunity, 0-HP hooks, combat songs,
toggled speed) all need code hooks beyond what Active Effects provide.

---

## 2. Foundry v14 hooks catalog (master list)

### 2.1 Lifecycle hooks (document creation/update/deletion)

These are the core hooks for intercepting or modifying document changes.
Each fires for its type-specific name by substitution: `preCreateActor`,
`updateChatMessage`, `deleteCombat`, etc.

```
preCreateDocument(document, data, options, userId) -> boolean|void
createDocument(document, options, userId)
preUpdateDocument(document, changed, options, userId) -> boolean|void
updateDocument(document, changed, options, userId)
preDeleteDocument(document, options, userId) -> boolean|void
deleteDocument(document, options, userId)
```

- `pre*` hooks can cancel by returning `false`.
- They fire on the initiating client only.
- `changed` is the differential data about to be applied.

### 2.2 Rendering hooks

```
renderChatMessageHTML(message, html, context)   -- modify chat card HTML
renderChatInput(app, html)                       -- modify chat input area
renderCombatTracker(app, html, data)             -- combat tracker sidebar
renderActorSheet(actor, html, data)              -- character sheet
renderItemSheet(item, html, data)                -- item sheet
renderTokenHUD(app, html, token)                -- token HUD buttons
getSceneControlButtons(controls)                 -- add canvas controls
hotbarDrop(hotbar, data, slot)                   -- macro bar drops
```

The critical one for chat button injection:
`renderChatMessageHTML(message, html, context)` fires for every chat message
as its HTML renders. A module appends elements to `html` to add buttons.

### 2.3 Combat hooks

```
combatStart(combat, data)
combatTurn(combat, data)
combatTurnChange(combat, data)
combatRound(combat, data)
```

### 2.4 Canvas/system hooks

```
canvasReady(canvas)
targetToken(user, token, active)
dropActorSheetData(actor, sheet, data)
applyTokenStatusEffect(token, change)
modifyTokenAttribute(attr, value, ...)  -- HP changes via token sheet
```

### 2.5 Active Effect hooks

```
applyActiveEffect(actor, change, current, delta, changes)
```

Fires inside `_applyChangeCustom` for `custom.N` change types only. A module
registers a handler via `CONFIG.ActiveEffect.changeTypes`:

```js
CONFIG.ActiveEffect.changeTypes["custom.Cleave"] = {
  label: "Cleave Extra Attack",
  defaultPriority: 0,
  handler: (targetDoc, change, {field, replacementData, modifyTarget}) => {
    // custom logic here; modify targetDoc.system.* directly
    // read pre-hook value: getProperty(targetDoc, change.key)
    // write post-hook value: setProperty(targetDoc, change.key, newValue)
  }
};
```

### 2.6 Settings and extension hooks

```
clientSettingChanged(setting, value, options)
getProseMirrorMenuDropDowns(app, menu)
hotReload(data, source)
```

---

## 3. Chat Messages API

### 3.1 ChatMessage structure (v14)

```
ChatMessage schema (client/documents/chat-message.mjs):
- content: string (HTML, enriched)
- rolls: ArrayField(JSONField) -- the Roll objects
- speaker: {actor, token, scene, alias}
- blind: boolean
- whisper: string[] (user IDs)
- flags: DocumentFlagsField (arbitrary module data)
- style: CONST.CHAT_MESSAGE_STYLES.{IC,OTHER}  -- new in v14
- rolls: [Roll] -- accessed as this.rolls, populated in prepareDerivedData
```

`message.rolls` contains Roll instances (reconstructed from JSON in
`prepareDerivedData`). A module stores per-message automation state in
`flags.<module-id>`:

```js
// Writing flags on a message:
await message.update({"flags.ose-reforged.cleaveState": {actorId: "...", killCount: 0}});

// Reading flags in a hook:
const state = message.flags["ose-reforged"]?.cleaveState;
```

### 3.2 Roll.toMessage (how rolls embed in chat)

```js
const roll = new Roll(formula);
await roll.evaluate({allowStrings: true});
roll.toMessage(messageData, {messageMode: "public"});
// or
ChatMessage.create({
  speaker: ChatMessage.getSpeaker({actor}),
  rolls: [roll],
  content: String(roll.total),
  flags: {"ose-reforged": {myState: {...}}}
});
```

v14 deprecates `rollMode` in favor of `messageMode`. Valid modes:
`"public"`, `"gm"`, `"blind"`, `"self"`, `"ic"` (defined in
`CONFIG.ChatMessage.modes`). Modes support a custom `handler` function.

### 3.3 Chat card button pattern (OSE's model)

OSE registers: `Hooks.on("renderChatMessageHTML", addChatMessageButtons)`

The function `addChatMessageButtons(msg, html)` (ose.js:5836) does:
1. Hides blind-roll content for non-GMs
2. Finds `.damage-roll` elements in the rendered card
3. Creates a `<button data-action="apply-damage">` with an `fa-tint` icon
4. Appends it to the card
5. Attaches a direct click listener: `button.addEventListener("click", ...)`

For OSE's chat card action routing (ose.js:3856), the delegated listener
is registered in `OseItem.chatListeners(html)` which hooks `renderChatLog`:
```js
html.addEventListener("click", (event) => {
  const button = event.target.closest(".card-buttons button");
  if (button) OseItem._onChatCardAction(event);
});
// _onChatCardAction routes by button.dataset.action:
//   "damage" -> item.rollDamage({event})
//   "formula" -> item.rollFormula({event})
//   "save" -> targets.forEach(t => t.rollSave(button.dataset.save))
```

### 3.4 Adding option buttons to attack messages (module pattern)

A module uses the same hook to inject buttons into attack cards:

```js
// In module init:
Hooks.on("renderChatMessageHTML", (message, html) => {
  // Only act on OSE attack messages
  const card = html.querySelector(".ose.chat-card");
  if (!card) return;

  const actorId = card.dataset.actorId;
  const itemId = card.dataset.itemId;
  const rollData = message.rolls[0]?.data; // the OseDice rollData

  // Add a "Cleave" button if actor has Cleave and this was a hit
  if (rollData?.roll.type === "melee" && message.flags["ose-reforged"]?.hit) {
    const btn = document.createElement("button");
    btn.dataset.action = "cleave";
    btn.innerHTML = '<i class="fas fa-skull"></i> Cleave';
    btn.addEventListener("click", async (ev) => {
      const actor = game.actors.get(actorId);
      // trigger cleave logic
    });
    card.querySelector(".card-buttons")?.append(btn);
  }
});
```

---

## 4. Active Effects deep API

### 4.1 Change schema (v14)

```
system.changes[]:
  key: string (e.g. "system.saves.spell.value")
  type: string ("add"|"subtract"|"multiply"|"override"|"upgrade"|"downgrade"|"custom.N")
  value: string|number (AnyField; add/subtract handlers coerce)
  phase: "initial"|"final" (default: "initial")
  priority: number|null
```

### 4.2 applyChange dispatch (active-effect.mjs:515)

```
1. Resolve field from change.key (system.* → system.getFieldForProperty)
2. If CHANGE_TYPES[change.type]?.handler exists → call handler (custom types)
3. Else if field exists → applyChangeField (typed add/multiply/override/etc)
4. Else → _applyChangeUnguided (generic setProperty path)
```

### 4.3 Registered change types

Core types in `CONST.ACTIVE_EFFECT_CHANGE_TYPES` (constants.mjs:89):
`add`, `subtract`, `multiply`, `override`, `upgrade`, `downgrade`.

Custom types via `CONFIG.ActiveEffect.changeTypes`:
```js
CONFIG.ActiveEffect.changeTypes["custom.MyType"] = {
  label: "My Custom Effect",
  defaultPriority: 0,
  handler: (targetDoc, change, {field, replacementData, modifyTarget}) => { ... }
};
```

### 4.4 Transfer mechanics

- `transfer: true` on an item's effect → `Actor#allApplicableEffects` yields
  it when the item is on the actor. OSE doesn't override this.
- Effects are invisible on OSE sheets (no effects tab) but their value
  changes appear in affected stats.
- `phase: "initial"` feeds into derived data (scores/AC/movement recalc);
  `phase: "final"` runs after derived data.

### 4.5 Expiry events

```
CONST.ACTIVE_EFFECT_EXPIRY_EVENTS (constants.mjs:69):
  combatStart, roundStart, turnStart, combatEnd
```

The `duration.expiry` field references these. A module can also check
`effect.isExpired` / `effect.isSuppressed`.

### 4.6 Hooks

- `applyActiveEffect(actor, change, current, delta, changes)` — fires only
  for `custom.N` change types. Lets a module handle arbitrary computed
  effects during prepareData.

---

## 5. Sheet extension points

### 5.1 v1 ActorSheet (what OSE uses)

OSE sheets are legacy v1:
```
class OseActorSheetCharacter extends ActorSheet
class OseActorSheetMonster extends OseActorSheet
class OseItemSheet extends ItemSheet
```

Key extension points:
- `getData()` → returns template data (abilities, saves, etc.)
- `activateListeners(html)` → jQuery-based event binding
- `static defaultOptions` → tab config, template, dimensions
- `renderActorSheet(app, html, data)` → post-render hook

OSE registers the legacy way:
```
foundry.documents.collections.Actors.registerSheet("ose", OseActorSheetCharacter, ...)
foundry.documents.collections.Items.registerSheet("ose", OseItemSheet, ...)
```

### 5.2 How to extend OSE sheets from a module

Pattern: wrap the sheet class via `CONFIG.Actor.sheetClasses`:

```js
// Patch all character sheets to add a header button
const originalGetHeaderButtons = OseActorSheetCharacter.prototype.getHeaderButtons;
OseActorSheetCharacter.prototype.getHeaderButtons = function() {
  const buttons = originalGetHeaderButtons.call(this);
  buttons.unshift({label: "Reforged", icon: "fas fa-bolt", onclick: () => openReforgedPanel(this.actor)});
  return buttons;
};
```

Or hook the render to inject elements:
```js
Hooks.on("renderActorSheet", (app, html, data) => {
  if (app.actor.type !== "character") return;
  // inject new tab or button into html
});
```

### 5.3 Tab system (v1 OSE style)

Character sheet tabs are `<a class="item" data-tab="X">` +
`<div class="tab" data-group="primary" data-tab="X">`, configured in
`defaultOptions.tabs: [{navSelector, contentSelector, initial}]`.

To add a new tab, a module can:
1. Render a new nav link into `.tabs` via render hook
2. Render a new `<div class="tab">` into `.sheet-body`
3. Configure it in the tabs array (or use jQuery `html.find` to append)

### 5.4 Tweaks dialog (the manual AE surface)

`OseEntityTweaks extends FormApplication` (ose.js:2154), edits:
```
system.thac0.mod.melee     system.thac0.mod.missile
system.initiative.mod       system.ac.mod / system.aac.mod
system.details.magic.bonus  system.details.xp.bonus
system.encumbrance.max      (etc.)
```

This is what AEs automate. The dialog confirms these fields are OSE's
canonical "tweakable" stat surface.

---

## 6. OSE system pipeline reference

### 6.1 Attack roll (rollAttack, ose.js:4755)

```
rollParts: ["1d20"]
+ bba (if ascendingAC)
+ [str.mod OR dex.mod depending on type]
+ thac0.mod.melee OR thac0.mod.missile
+ item.system.bonus
rollData.roll = { type, thac0, dmg:[damage_formula, ...mods], save, target }
-> OseDice.Roll({ parts: rollParts, data: rollData, flavor, speaker })
```

Hook points:
- `game.user.targets` gives target tokens → read `actor.system.ac.aac.value`
  for ascending AC comparison
- Module wraps `OseActor.prototype.rollAttack` or intercepts
  `OseDice.Roll` call to inject conditional parts (vs-giant bonus, etc.)

### 6.2 Damage roll (rollDamage)

```
dmgParts = [item.system.damage || "1d6"]
+ item.system.bonus (if not ignoreBonusDamage)
+ str.mod (melee only, via attackMods)
-> OseDice.Roll({ parts: dmgParts, data: rollData, flavor: "Damage" })
```

### 6.3 Damage application (applyDamage, ose.js:4819)

```js
async applyDamage(amount = 0, multiplier = 1) {
  const damage = Math.floor(parseInt(amount, 10) * multiplier);
  return this.update({ "system.hp.value": Math.clamp(value - damage, 0, max) });
}
```

Options for "apply damage" are controlled by
`CONFIG.OSE.apply_damage_options`: `originalTarget`, `targeted`, `selected`.

**Hook for DR:** wrap `OseActor.prototype.applyDamage` to subtract from
`amount` before the `update()`. Or intercept `preUpdateActor` for
`system.hp.value` changes and subtract DR.

**Hook for reactive AC (Dodge Die):** intercept the damage roll call in
rollDamage or the applyChatCardDamage function, roll an extra die, add to AC
temporarily via a flag + `update()`.

### 6.4 Save roll (rollSave, ose.js:4461)

```
rollParts: ["1d20"]
rollData.roll = { type: "above", target: saves[save].value, magic, poison }
-> OseDice.RollSave({ parts, data, flavor: "OSE.roll.save", speaker })
```

- Characters use `OseDice.RollSave` (includes magic/poison bonuses)
- Monsters use `OseDice.Roll`

The chat card template already renders a `data-action="save"` button when
`data.save` is set — this is what the official module leverages for
assassination's death save.

### 6.5 Ability roll (rollFormula, ose.js:3930)

For items with `system.roll` set (abilities, thief skills, sage skills):
```
rollParts = [item.system.roll]  (e.g. "1d6", "1d100")
rollData.roll = {
  type: item.system.rollType,      // "below", "above", "result"
  target: item.system.rollTarget,
  blindroll: item.system.blindroll,
}
save: item.system.save  (if set, chat card shows save button)
```

This flows into `OseDice.Roll` → `sendRoll` → `templates/chat/roll-result.html`.

### 6.6 OseDice.sendRoll (ose.js:1333)

```
roll = new Roll(parts.join("+"), data); await roll.evaluate()
rollMode: getRollMode() + overrides from form
blindroll → forces selfroll (GM) or blindroll (player)
chatData.whisper = ChatMessage.getWhisperRecipients("GM")
chatData.blind = true (if blindroll)
result = digestResult(data, roll)  // isSuccess/isFailure from type+target
ChatMessage.create({user, speaker, content: renderTemplate(...), sound})
```

### 6.7 Chat card listener routing (ose.js:3856, ~4233)

```
static chatListeners(html) {  // called via renderChatLog hook
  html.addEventListener("click", (event) => {
    const button = event.target.closest(".card-buttons button");
    if (button) OseItem._onChatCardAction(event);
  });
}
_onChatCardAction:
  action = button.dataset.action  → "damage" | "formula" | "save"
  actor = _getChatCardActor(card)  (via card.dataset.tokenId or actorId)
  targets = _getChatCardTargets(card) (controlled tokens + game.user.character)
```

### 6.8 Monster attack flow (targetAttack, ose.js:4727)

```
targetAttack(data, type, options) {
  if (game.user.targets.size > 0)
    for each target: data.roll.target = token; rollAttack(data, {type})
  else: rollAttack(data, {type})
}
```

### 6.9 Initiative

OSE `get init()` (ose.js:3653):
```
(group ? group_init : 0) + (initiative.value||0) + (initiative.mod||0) + dex.init
```

`CONFIG.Combat.initiative.formula` is set by OSE at init (ose.js:15569).

---

## 7. Feature-to-automation map

### Tier 1: Achievable with existing mechanisms (next release)

| Feature | Mechanism | Hook/UI |
|---|---|---|
| **Fighter Cleave** | On-hit kill: extra attack | `renderChatMessageHTML` → detect hit+kill in flags, show "Cleave?" button |
| **Acrobat Dodge Die** | Reactive AC on being hit | Wrap `applyDamage` or flag-based temp AC via `updateActor` |
| **Halfling Lucky** | Once/day reroll failed save | `renderChatMessageHTML` → detect `isFailure` + flag, show "Reroll" button |
| **Dwarf Stout Fortune** | Reroll once/day | Same as Lucky |
| **Duergar Iron Will** | Reroll save vs Poison/Spells | Same pattern, restricted by save category |
| **Acrobat Evasion** | Reroll save vs Breath/Spells | Same pattern, restricted by save category |
| **Barbarian Battle Senses** | Surprise: save vs Death | Set `system.save = "death"` (done in metadata), add temp AC on initiative |
| **Half-Orc Grim Tenacity** | Save vs Death at 0 HP | `preUpdateActor` for `system.hp.value` → inject death save prompt |
| **Drow/Elf/Half-Elf Sleep/Paralysis Immunity** | No save needed | `preUpdateActor` intercept status apply, block paralysis/sleep |
| **Dwarf Attack Giant Foes** (+2 vs giants) | Conditional atk bonus | `rollAttack` wrapper: check target actor size, append +2 if giant |
| **Duergar Harm Giant Foes** (+2 dmg vs giants) | Conditional dmg bonus | Same: check target, add +2 to dmgParts |
| **Halfling Underfoot Defense** (-1 to hit halfling) | Inverted: +1 AC vs large | `preUpdateActor` or `applyActiveEffect` hook: temp AC flag on combat start |
| **Ranger Fleet in Terrain** (+10 ft) | Toggled movement | `getSceneControlButtons` → toggle button, `system.movement.base` AE |
| **Cleric Faith's Influence** (+1/+2 social) | Toggle for social checks | `system.thac0.mod.melee` via disabled AE, toggled via header button |
| **Sage Precise Strikes** (INT mod to atk) | Per-weapon logic | RollAttack wrapper: replace str.mod with int.mod if proficient+weapon flag |
| **Finesse variants** (DEX for STR) | Weapon ability selection | RollAttack wrapper: if weapon has `flags.ose-reforged.finesse`, use dex |
| **Barbarian Damage Reduction** (DR 1-2) | Pre-damage reduction | Wrap `applyDamage`: subtract DR from amount before update |
| **Knight Shield Stand** (+2 AC w/ shield) | Conditional AC | Combat start: check adjacent allies with shields → update ac.mod |

### Tier 2: Needs more infrastructure

| Feature | Mechanism |
|---|---|
| **Bard Battle Songs** (+2 ally morale / -2 enemy atk) | Macro-based toggle; morale is monster-only |
| **Paladin Dedication** (conditional atk/dmg) | RollAttack wrapper + target alignment check |
| **Ranger Enemy Slayer** (assassinate common enemies) | RollAttack wrapper + target type/alignment check |
| **Sage Keen Observation** (targeted temp AE) | `targetToken` hook → grant temporary AE to target |
| **Drow Dark Assassination** (+4 atk in darkness) | Combat state check: token in darkness + target unaware |

---

## 8. Architecture recommendation

### 8.1 Module structure

```
ose-apo-reforged-automation/
  ose-apo-reforged-automation.js     -- entry point
  scripts/
    hooks.js                         -- all Hook registrations
    cleave.js                        -- Fighter Cleave logic
    dodge-die.js                     -- Acrobat Dodge Die
    reroll-once.js                   -- Lucky/Stout Fortune/Iron Will/Evasion
    giant-foes.js                    -- Dwarf/Duergar giant bonuses
    dr.js                            -- Barbarian damage reduction
    grim-tenacity.js                 -- Half-Orc 0-HP hook
    sleep-paralysis-immunity.js      -- status interception
    finesse.js                       -- DEX-for-STR attack rolls
    toggle-features.js               -- social/movement toggles
    chat-buttons.js                  -- renderChatMessageHTML handlers
```

### 8.2 Key patterns

1. **Chat buttons**: hook `renderChatMessageHTML`, check message type and
   flags, append buttons with unique `data-action` values, use a single
   delegated click listener on `document.body` (or `#chat-log`) routing
   by action.

2. **Conditional roll bonuses**: wrap `OseActor.prototype.rollAttack` or
   `OseDice.Roll` to inspect `data.roll.target` (token), read target
   actor properties (size, alignment, HP), and append/modify rollParts.

3. **Rerolls**: on `renderChatMessageHTML`, check `result.isFailure` in
   `OseDice.digestResult` output (stored on the roll's total/target) and
   actor flags for `oncePerDay` usage. Show button; on click, re-roll and
   create a new message.

4. **DR/pre-damage**: wrap `applyDamage` or intercept the
   `applyChatCardDamage` function (ose.js:5793) to subtract from damage
   before the HP update.

5. **Status immunity**: hook `preUpdateActor` checking for status additions
   (`changes` with `statuses` path) and block if the status is in the
   immunity list for that actor type.

6. **Toggle features**: use `getSceneControlButtons` or header buttons on
   OSE sheet to flip a `flags.ose-reforged.featureEnabled` boolean, then
   conditionally apply an AE or modify rollParts based on it.

7. **Custom AE types**: register via `CONFIG.ActiveEffect.changeTypes` for
   effects that need computed values (Cleave counter, DR value based on
   level, etc.) rather than static key/value.

---

## 9. Risks and guardrails

- **OSE sheet compatibility**: OSE uses v1 ActorSheet. Module extensions
  must not break v1 patterns (jQuery, `html.find`, `data-tab`).
- **Roll pipeline coupling**: OSE's `OseDice.Roll` is the central
  pipeline. Wrapping `rollAttack` is safer than wrapping `OseDice.Roll`
  (which is also used for saves, morale, etc.).
- **No effects tab**: OSE sheets don't show effects. Any toggled AE needs
  a custom UI (header button, scene control, or chat command) to toggle.
- **monster_saves**: monsters use a fixed table (CONFIG.OSE.monster_saves
  by HD) rather than character saves. Monster AEs targeting saves won't
  display on the sheet (no save row shown for monsters).
- **Backward compatibility**: new features should be opt-in via module
  settings (game.settings.register) so GMs can disable specific automation.

---

## 10. API cross-references

### Foundry v14 source files
- Hooks catalog: `client/hooks.mjs`
- ActiveEffect: `client/documents/active-effect.mjs`, `common/data/active-effect.mjs`
- ChatMessage: `client/documents/chat-message.mjs`, `common/documents/chat-message.mjs`
- Roll: `client/dice/roll.mjs`
- CONFIG (modes, effects): `client/config.mjs`
- Constants (CHANGE_TYPES, expiry): `common/constants.mjs`
- Combat: `client/documents/combat.mjs`, `client/documents/combatant.mjs`

### OSE source files (dist/ose.js compiled)
- OseActor: ~4300-4860 (rollAttack, rollDamage, applyDamage)
- OseDice: ~1333-1600 (Roll, RollSave, sendRoll, digestResult)
- OseItem: ~3856-4310 (chatListeners, rollFormula, rollWeapon, _onChatCardAction)
- OseActorSheetCharacter: ~2440-3200 (activateListeners, _rollAttack)
- CONFIG.OSE: ~1000-1270
- Hooks registrations: ~15552-15671
- Tweaks dialog: ~2154-2250
