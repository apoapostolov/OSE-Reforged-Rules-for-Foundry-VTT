/**
 * OSE Reforged Rules — Tier 1 Automation
 * ======================================
 * Companion runtime for the ose-apo-reforged-rules compendium.
 *
 * Tier 1 features (all source-verified against Foundry 14.359 + OSE 2.3.0):
 *
 *   Chat-card option buttons (renderChatMessageHTML):
 *   - Cleave (Fighter)              on hit attack cards
 *   - Dodge Die (Acrobat)           on attack cards targeting the acrobat
 *   - Rerolls (Lucky, Stout Fortune, Iron Will, Acrobat Evasion)
 *                                   on failed save cards
 *   - Grim Tenacity (Half-Orc)      save vs Death at 0 hp
 *
 *   Roll pipeline wrappers (rollAttack / rollDamage / applyDamage):
 *   - Attack Giant Foes (Dwarf)     +2 attack vs giants
 *   - Harm Giant Foes (Duergar)     +2 damage vs giants
 *   - Underfoot Defense (Halfling)  large foes -1 to hit the halfling
 *   - Damage Reduction (Barbarian)  DR 1 (2 at 9th) on damage application
 *   - Finesse variants (Drow/Elf/Half-Elf)  DEX instead of STR
 *   - Precise Strikes (Sage)        INT mod to attack and damage
 *
 *   Sheet header buttons (renderActorSheet):
 *   - Fleet in Terrain (Ranger)     +10 ft movement toggle
 *   - Faith's Influence (Cleric)    social check bonus toggle
 *   - Shield Stand (Knight)         +2 AC with shield toggle
 *   - Battle Senses (Barbarian)     save vs Death when surprised
 *
 *   Actor hooks:
 *   - Sleep/Paralysis Immunity (Drow/Elf/Half-Elf)
 *                                   blocks the statuses on the actor
 *
 * Every button carries an emoji/glyph before its label and a hover tooltip
 * explaining the rule it applies. The CSS reuses OSE core classes
 * (.ose.chat-block, .card-buttons, .roll-result) plus a small polish layer.
 */

export const MODULE_ID = "ose-apo-reforged-rules";
export const FLAG_ROOT = "ose-apo-reforged-rules";

export const FEATURES = {
  cleave: "Cleave",
  dodgeDie: "Dodge Die",
  lucky: "Lucky",
  stoutFortune: "Stout Fortune",
  ironWill: "Iron Will",
  acrobatEvasion: "Acrobat Evasion",
  grimTenacity: "Grim Tenacity",
  attackGiantFoes: "Attack Giant Foes",
  harmGiantFoes: "Harm Giant Foes",
  underfootDefense: "Underfoot Defense",
  damageReduction: "Damage Reduction",
  dexFinesse: "Dex Finesse (Drow arms)",
  elvenFinesse: "Elven Finesse",
  mixedFinesse: "Mixed Finesse",
  preciseStrikes: "Precise Strikes",
  fleetInTerrain: "Fleet in Terrain",
  faithInfluence: "Faith's Influence",
  shieldStand: "Shield Stand",
  battleSenses: "Battle Senses",
  sleepParalysisImmunity: "Immunity to Sleep and Paralysis",
};

// Finesse features by name (any of them activates DEX-for-STR logic).
export const FINESSE_FEATURES = [
  FEATURES.dexFinesse,
  FEATURES.elvenFinesse,
  FEATURES.mixedFinesse,
];

// Reroll features mapped to the save categories they may reroll.
// The ability text decides which saves each feature covers.
export const REROLL_SAVE_MAP = {
  [FEATURES.lucky]: ["death", "wand", "paralysis", "breath", "spell"],
  [FEATURES.stoutFortune]: ["death", "paralysis", "spell"], // not Rods and Staves (wand)
  [FEATURES.ironWill]: ["death", "spell"], // Poison or Spells
  [FEATURES.acrobatEvasion]: ["breath", "spell", "wand"], // Breath or Spells/Wands/Staves
};
