/**
 * Character-sheet header buttons for Tier 1 toggle features.
 *
 * Adds buttons to the OSE character sheet header (via renderActorSheet)
 * with emoji + hover tooltips explaining each rule. Toggle features write
 * actor flags that the roll wrappers read; Battle Senses rolls its save
 * directly.
 */
import { FLAG_ROOT, FEATURES } from "./constants.js";
import { hasFeature } from "./helpers.js";

const TOGGLES = {
  [FEATURES.fleetInTerrain]: {
    emoji: "🏃",
    label: "Fleet in Terrain",
    flag: "fleetActive",
    tooltip:
      "Fleet in Terrain: your walking speed in your favored terrain increases " +
      "by 10 feet when not impeded by armor, rugged terrain, or other circumstances.",
  },
  [FEATURES.faithInfluence]: {
    emoji: "⚖️",
    label: "Faith's Influence",
    flag: "faithActive",
    tooltip:
      "Faith's Influence: when making a Reaction check, or a Wisdom or Charisma " +
      "check against a target who recognizes your religion and is not in an " +
      "authoritative position, you gain +1 to the check (+2 if the target shares " +
      "your faith and alignment). Targets actively hostile to your faith may suffer " +
      "a similar penalty at the DM's discretion.",
  },
  [FEATURES.shieldStand]: {
    emoji: "🛡️",
    label: "Shield Stand",
    flag: "shieldActive",
    tooltip:
      "Shield Stand: announce before rolling initiative each round; it precludes " +
      "movement this turn. Your benefit from using a shield and all adjacent allies " +
      "wielding a shield increases from +1 to +2 to AC and +1 to Parry attack rolls " +
      "until the start of the next turn.",
  },
};

// Roll buttons (no persistent state; each click rolls the feature's dice).
const ROLL_BUTTONS = {
  [FEATURES.battleSenses]: {
    emoji: "👁️",
    label: "Battle Senses",
    tooltip:
      "Battle Senses: when caught surprised, unaware, or blind-fighting, the " +
      "bonus enemies receive to hit you is reduced to +2 instead of +4. When " +
      "surprised or in pitch darkness, you can save vs Death to prevent damage " +
      "against you from being doubled.",
    async action(actor) {
      await actor.rollSave("death", { fastForward: true });
    },
  },
};

const SHIELD_STAND_AC = ["system.ac.mod", "system.aac.mod"];

/**
 * Add toggle buttons to the character sheet header.
 * @param {ApplicationV2|ActorSheet} app
 * @param {jQuery|HTMLElement} html
 */
export function addSheetButtons(app, html) {
  const actor = app.actor;
  if (!actor || actor.type !== "character") return;
  const root = html[0]?.querySelector(".header-details");
  if (!root) return;

  const toggleEntries = Object.entries(TOGGLES).filter(([name]) => hasFeature(actor, name));
  const rollEntries = Object.entries(ROLL_BUTTONS).filter(([name]) => hasFeature(actor, name));
  if (!toggleEntries.length && !rollEntries.length) return;

  // One container for all Reforged toggles, appended after the summary row.
  let row = root.querySelector(".rf-toggle-row");
  if (!row) {
    row = document.createElement("div");
    row.className = "rf-toggle-row";
    root.append(row);
  }

  for (const [featureName, cfg] of toggleEntries) {
    const active = actor.getFlag(FLAG_ROOT, cfg.flag) === true;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `rf-toggle rf-btn ${active ? "active" : ""}`;
    btn.dataset.rfTooltip = cfg.tooltip;
    btn.dataset.rfToggle = featureName;
    btn.innerHTML = `<span class="rf-btn-emoji">${cfg.emoji}</span> ${cfg.label}`;
    btn.addEventListener("click", async () => {
      const isActive = actor.getFlag(FLAG_ROOT, cfg.flag) === true;
      await actor.setFlag(FLAG_ROOT, cfg.flag, !isActive);
      await applyToggleSideEffects(actor, featureName, !isActive);
      btn.classList.toggle("active", !isActive);
    });
    row.append(btn);
  }

  for (const [featureName, cfg] of rollEntries) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rf-toggle rf-btn";
    btn.dataset.rfTooltip = cfg.tooltip;
    btn.dataset.rfRoll = featureName;
    btn.innerHTML = `<span class="rf-btn-emoji">${cfg.emoji}</span> ${cfg.label}`;
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        await cfg.action(actor);
      } finally {
        btn.disabled = false;
      }
    });
    row.append(btn);
  }
}

/**
 * Apply (or revert) the mechanical side effects of a toggle feature.
 * @param {Actor} actor
 * @param {string} featureName
 * @param {boolean} enabling
 */
async function applyToggleSideEffects(actor, featureName, enabling) {
  if (featureName === FEATURES.shieldStand) {
    // Shield Stand: +1 extra AC on top of the normal shield bonus while
    // active. The tooltip explains the full rule; AC mod is the lever the
    // OSE sheet already reads (Tweaks dialog uses these same keys).
    const delta = enabling ? 1 : -1;
    const updates = {};
    for (const key of SHIELD_STAND_AC) updates[key] = (foundry.utils.getProperty(actor.system, key) ?? 0) + delta;
    await actor.update(updates);
  }
}

export function registerSheetHooks() {
  Hooks.on("renderActorSheet", (app, html) => addSheetButtons(app, html));
}
