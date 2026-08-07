/**
 * OSE Reforged Rules — Tier 1 Automation entry point.
 *
 * Loads the automation layer for the compendium module. All features are
 * feature-detected from the actor's items, so no manual configuration is
 * needed: drag the Reforged ability onto a character and the automation
 * activates.
 */
import { MODULE_ID } from "./constants.js";
import { registerChatHooks } from "./chat-cards.js";
import { patchRollAttack, patchApplyDamage, patchRollCheck } from "./roll-patches.js";
import { registerActorHooks } from "./actor-hooks.js";
import { registerSheetHooks } from "./sheet-buttons.js";
import { registerRoundUsageHooks } from "./helpers.js";

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "automationEnabled", {
    name: "Reforged Tier 1 Automation",
    hint:
      "Enables chat-card buttons, roll bonuses, and sheet toggles for Reforged " +
      "class features (Cleave, Dodge Die, rerolls, giant-foe bonuses, damage " +
      "reduction, finesse, precise strikes, immunities, and sheet toggles).",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });
});

Hooks.once("ready", () => {
  if (game.system.id !== "ose") return;
  if (!game.settings.get(MODULE_ID, "automationEnabled")) return;

  const Actor = CONFIG.Actor.documentClass;
  if (!Actor) return;

  // Patch the roll pipeline. Prototype methods are the stable seam: OSE's
  // rollAttack and applyDamage are the chokepoints the sheet and chat cards
  // use for these operations. (rollDamage builds from attData.roll.dmg which
  // rollAttack already computed, so the attack wrapper covers it.)
  Actor.prototype.rollAttack = patchRollAttack(Actor.prototype.rollAttack);
  Actor.prototype.applyDamage = patchApplyDamage(Actor.prototype.applyDamage);
  Actor.prototype.rollCheck = patchRollCheck(Actor.prototype.rollCheck);

  // Chat card buttons + sheet header toggles + actor status hooks.
  registerChatHooks();
  registerSheetHooks();
  registerActorHooks();
  registerRoundUsageHooks();

  console.log(`${MODULE_ID} | Tier 1 automation active`);
});
