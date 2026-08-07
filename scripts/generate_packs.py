#!/usr/bin/env python3
"""
ose-apo-reforged-rules pack generator.

Reads three sources of truth and emits the Reforged Class Features pack
as a classic-level directory (Foundry v13/v14 format, same as fvtt CLI):

  1. Official OSE abilities: ose-advancedfantasytome _source JSON (per-class items)
  2. APO homebrew: ose-statblock-importer homebrew.json (newAbilities + modifications)
  3. House rules doc: OSE_NEW_CONTENT.md (Sage class, absent from homebrew.json)

Output: a JSON manifest consumed by build_pack.mjs (node) which writes the
classic-level DB under Data/modules/ose-apo-reforged-rules/packs/.
"""

import json
import os
import random
import re
import string
import sys
import html

# ---------------------------------------------------------------- paths
FOUNDRY = os.path.expanduser("~/FoundryData.14")
OFFICIAL_ABILITIES = os.path.join(
    FOUNDRY, "Data/modules/ose-advancedfantasytome/packs/_source/abilities/classes"
)
HOMEBREW_JSON = os.path.join(
    FOUNDRY, "Data/modules/ose-statblock-importer/homebrew/homebrew.json"
)
NEW_CONTENT_MD = "/mnt/c/git/lifestyle/rpg_projects/houserules/old-school-essentials/OSE_NEW_CONTENT.md"
OUT_MANIFEST = "/tmp/reforged-pack-manifest.json"

# ---------------------------------------------------------------- config
# Tier grouping follows OSE_HOUSE_RULES.md (Basic / Demihuman / Advanced / New)
TIERS = {
    "Basic Classes": ["cleric", "fighter", "magic-user", "thief"],
    "Demihuman Classes": [
        "drow", "dwarf", "duergar", "elf", "gnome", "half-elf",
        "half-orc", "halfling", "svirfneblin",
    ],
    "Advanced Classes": [
        "acrobat", "assassin", "barbarian", "bard", "druid",
        "illusionist", "knight", "paladin", "ranger",
    ],
    "New Classes": ["sage"],
}

# ---------------------------------------------------------------- metadata
# Roll/save metadata per (class, item name). Mirrors the official OSE module
# pattern: `roll` formula + `rollType` (below/above/result) + `rollTarget` +
# `blindroll` (secret DM rolls) + `save` (save category the ability triggers).
# The official module applies ZERO active effects; it encodes mechanics as
# roll metadata and manual Tweaks entries. We keep that pattern for dice
# mechanics and add transfer:true AEs only where the OSE data model can
# express a passive numeric bonus (saves / attack mods / initiative).
META = {
    # ---- Cleric
    ("cleric", "Cure Disease (Ritual)"): {"roll": "1d6", "rollType": "below", "rollTarget": 4, "blindroll": False},
    # ---- Drow
    ("drow", "Poisoncraft (Spiders)"): {"roll": "1d3", "rollType": "result", "rollTarget": 0, "blindroll": False},
    # ---- Elf / Half-Elf / Drow / Half-Orc low-light vision: descriptive only
    # ---- Gnome
    ("gnome", "Terrain Hiding"): {"roll": "1d6", "rollType": "below", "rollTarget": 4, "blindroll": True},
    # ---- Halfling
    ("halfling", "Terrain Hiding"): {"roll": "1d6", "rollType": "below", "rollTarget": 5, "blindroll": True},
    # ---- Half-Elf
    ("half-elf", "See Through Pretense"): {"roll": "1d6", "rollType": "below", "rollTarget": 1, "blindroll": True},
    # ---- Half-Orc
    ("half-orc", "Grim Tenacity"): {"save": "death"},
    ("half-orc", "Brutal Grapple"): {"roll": "1d4", "rollType": "result", "rollTarget": 0, "blindroll": False},
    # ---- Svirfneblin
    ("svirfneblin", "Stone Camouflage"): {"roll": "1d6", "rollType": "below", "rollTarget": 4, "blindroll": True},
    ("svirfneblin", "Sure-Footed"): {"save": "breath"},
    # ---- Acrobat (FA = Falling skill, base 25% per Reforged progression)
    ("acrobat", "Tumbling Strike"): {"roll": "1d100", "rollType": "below", "rollTarget": 25, "blindroll": False},
    # ---- Barbarian
    ("barbarian", "Battle Senses"): {"save": "death"},
    # ---- Bard
    ("bard", "Stunning Flourish"): {"save": "spell"},
    ("bard", "Bardic Knowledge"): {"roll": "1d6", "rollType": "below", "rollTarget": 1, "blindroll": True},
    # ---- Druid
    ("druid", "Herbal Salves"): {"roll": "1d3", "rollType": "result", "rollTarget": 0, "blindroll": False},
    ("druid", "Antivenom Craft"): {"roll": "1d6", "rollType": "below", "rollTarget": 5, "blindroll": False},
    # ---- Illusionist
    ("illusionist", "Minor Conjurations"): {"roll": "1d6", "rollType": "below", "rollTarget": 3, "blindroll": True},
    # ---- Paladin
    ("paladin", "Clean of Body"): {"roll": "1d6", "rollType": "below", "rollTarget": 2, "blindroll": False},
    # ---- Ranger
    ("ranger", "Enemy Slayer"): {"save": "death"},
    # ---- Sage (percentile skills follow the Thief progression pattern)
    ("sage", "Sage Skills"): {"roll": "1d100", "rollType": "below", "rollTarget": 25, "blindroll": False},
    ("sage", "Erudite Sense"): {"roll": "1d100", "rollType": "below", "rollTarget": 25, "blindroll": True},
    ("sage", "Keen Observation"): {"roll": "1d100", "rollType": "below", "rollTarget": 20, "blindroll": False},
    ("sage", "Medical Prowess"): {"roll": "1d100", "rollType": "below", "rollTarget": 20, "blindroll": False},
    ("sage", "Research (Downtime)"): {"roll": "1d100", "rollType": "below", "rollTarget": 25, "blindroll": True},
    ("sage", "Workshop (Downtime)"): {"roll": "1d100", "rollType": "below", "rollTarget": 10, "blindroll": False},
    # ---- Modified thief/acrobat/barbarian skill items: house-rule L1 values
    #      (official module ships official L1 targets; Reforged reworks them)
    ("thief", "Open Locks (OL)"): {"roll": "1d100", "rollType": "below", "rollTarget": 10, "blindroll": False},
    ("thief", "Climb sheer surfaces (CS)"): {"roll": "1d100", "rollType": "below", "rollTarget": 25, "blindroll": False},
    ("thief", "Hear noise (HN)"): {"roll": "1d6", "rollType": "below", "rollTarget": 1, "blindroll": True},
    ("thief", "Hide In Shadows (HS)"): {"roll": "1d100", "rollType": "below", "rollTarget": 10, "blindroll": True},
    ("thief", "Move silently (MS)"): {"roll": "1d100", "rollType": "below", "rollTarget": 10, "blindroll": True},
    ("thief", "Pick Pockets (PP)"): {"roll": "1d100", "rollType": "below", "rollTarget": 10, "blindroll": False},
    ("thief", "Find/remove treasure traps (TR)"): {"roll": "1d100", "rollType": "below", "rollTarget": 10, "blindroll": True},
    ("assassin", "Climb sheer surfaces (CS)"): {"roll": "1d100", "rollType": "below", "rollTarget": 25, "blindroll": False},
    ("assassin", "Move Silently (MS)"): {"roll": "1d100", "rollType": "below", "rollTarget": 10, "blindroll": True},
    ("assassin", "Hear noise (HN)"): {"roll": "1d6", "rollType": "below", "rollTarget": 1, "blindroll": True},
    ("acrobat", "Climb sheer surfaces (CS)"): {"roll": "1d100", "rollType": "below", "rollTarget": 40, "blindroll": False},
    ("acrobat", "Tightrope Walking (TW)"): {"roll": "1d100", "rollType": "below", "rollTarget": 40, "blindroll": True},
    ("acrobat", "Falling (FA)"): {"roll": "1d100", "rollType": "below", "rollTarget": 25, "blindroll": False},
    ("acrobat", "Hide in shadows (HS)"): {"roll": "1d100", "rollType": "below", "rollTarget": 10, "blindroll": True},
    ("acrobat", "Move Silently (MS)"): {"roll": "1d100", "rollType": "below", "rollTarget": 10, "blindroll": True},
    ("barbarian", "Climb Sheer Surfaces (CS)"): {"roll": "1d100", "rollType": "below", "rollTarget": 25, "blindroll": False},
    ("barbarian", "Hide In Undergrowth (HD)"): {"roll": "1d100", "rollType": "below", "rollTarget": 10, "blindroll": True},
    ("barbarian", "Move Silently (MS)"): {"roll": "1d100", "rollType": "below", "rollTarget": 10, "blindroll": False},
}

# Passive always-on Active Effects (transfer: true, phase initial).
# Only features the OSE data model can express as numeric stat changes.
# Keys are OSE actor system paths (see systems/ose template.json).
# Note: OSE saves are target numbers — LOWER is better — so a "+2 bonus to
# saves vs X" is encoded as value -2 on the matching save category.
AES = {
    # Halfling Stout Heart: +2 saves vs charm/dominate/possess/compel (spell saves)
    ("halfling", "Stout Heart"): [
        {"key": "system.saves.spell.value", "type": "add", "value": "-2"},
    ],
    # Halfling Missile Attack Bonus (official item): the official module tells
    # the player to type +1 into Tweaks manually. An AE automates it.
    ("halfling", "Missile Attack Bonus"): [
        {"key": "system.thac0.mod.missile", "type": "add", "value": "1"},
    ],
    # Halfling Initiative Bonus (official optional-rule item): same manual
    # Tweaks note in the official module; automate it.
    ("halfling", "Initiative Bonus (Optional Rule)"): [
        {"key": "system.initiative.mod", "type": "add", "value": "1"},
    ],
    # Svirfneblin Illusion Resistance (official item): +2 saves vs illusions
    # -> spell save category.
    ("svirfneblin", "Illusion Resistance"): [
        {"key": "system.saves.spell.value", "type": "add", "value": "-2"},
    ],
}

# Features REMOVED by the house rules (doc lines say "loses X" / replaced).
# Keyed by class: official item names to drop from the compendium.
REMOVALS = {
    "elf": ["Infravision"],       # doc: elf loses Infravision 90' -> Low-Light Vision
    "half-elf": ["Infravision"],  # doc: half-elf loses Infravision 90' -> Low-Light Vision
}

DEFAULT_ICON = "systems/ose/assets/default/ability.png"
SAGE_ICON = "systems/ose/assets/default/ability.png"

CLASS_DISPLAY = {
    "cleric": "Cleric", "fighter": "Fighter", "magic-user": "Magic-User",
    "thief": "Thief", "drow": "Drow", "dwarf": "Dwarf", "duergar": "Duergar",
    "elf": "Elf", "gnome": "Gnome", "half-elf": "Half-Elf", "half-orc": "Half-Orc",
    "halfling": "Halfling", "svirfneblin": "Svirfneblin", "acrobat": "Acrobat",
    "assassin": "Assassin", "barbarian": "Barbarian", "bard": "Bard",
    "druid": "Druid", "illusionist": "Illusionist", "knight": "Knight",
    "paladin": "Paladin", "ranger": "Ranger", "sage": "Sage",
}

# ---------------------------------------------------------------- helpers
_ID_ALPHABET = string.ascii_letters + string.digits


def new_id(length=16):
    return "".join(random.choice(_ID_ALPHABET) for _ in range(length))


def para(text):
    """Wrap plain-text ability text in a <p> tag, escaping HTML."""
    clean = re.sub(r"\s+", " ", text).strip()
    return "<p>" + html.escape(clean) + "</p>"


def load_official_abilities():
    """Return {class_key: [item_dict, ...]} from the official _source."""
    result = {}
    for tier in ("classic", "advanced"):
        tier_dir = os.path.join(OFFICIAL_ABILITIES, tier)
        if not os.path.isdir(tier_dir):
            continue
        for cls in os.listdir(tier_dir):
            cls_dir = os.path.join(tier_dir, cls)
            if not os.path.isdir(cls_dir):
                continue
            items = []
            for fname in sorted(os.listdir(cls_dir)):
                if not fname.endswith(".json") or fname == "_folder.json":
                    continue
                with open(os.path.join(cls_dir, fname)) as f:
                    items.append(json.load(f))
            result[cls] = items
    return result


def load_homebrew():
    with open(HOMEBREW_JSON) as f:
        return json.load(f)


def make_item(name, text, icon, class_key, origin, oid=None, official=None):
    """Build a compendium item. `official` carries the original _id/stats for
    modified items so they stay drop-in compatible with the importer."""
    system = {
        "description": para(text),
        "autoTags": [],
        "manualTags": [],
        "save": "",
        "pattern": "white",
        "requirements": class_key,
        "roll": "",
        "rollType": "result",
        "rollTarget": 0,
        "blindroll": False,
    }
    return {
        "_id": oid or new_id(),
        "name": name,
        "type": "ability",
        "img": icon or DEFAULT_ICON,
        "effects": [],
        "flags": {"ose-apo-reforged-rules": {"origin": origin}},
        "system": system,
        "ownership": {"default": 0},
        "_stats": {
            "systemId": "ose",
            "systemVersion": "2.3.0",
            "coreVersion": "14.359",
            "createdTime": None,
            "modifiedTime": None,
            "lastModifiedBy": "apoapostolov",
        },
    }


def make_effect(name, changes, transfer=True, disabled=False, icon="icons/svg/aura.svg"):
    """Build a Foundry v14 ActiveEffect embedded on an item.

    v14 change schema: system.changes[] with {key, type (string), value,
    phase ("initial"), priority}. OSE uses core AE application (no system
    override), so transfer:true item effects apply to the actor. OSE's
    prepareDerivedData runs after the "initial" phase, so stat changes feed
    into derived values (saves, AC, movement).
    """
    return {
        "_id": new_id(),
        "name": name,
        "type": "base",
        "img": icon,
        "system": {
            "changes": [
                {
                    "key": c["key"],
                    "type": c.get("type", "add"),
                    "value": c.get("value", ""),
                    "phase": "initial",
                    "priority": None,
                }
                for c in changes
            ]
        },
        "disabled": disabled,
        "transfer": transfer,
        "duration": {"value": None, "units": "seconds", "expiry": None, "expired": False},
        "statuses": [],
        "flags": {},
    }


def apply_meta_and_aes(item, cls):
    """Apply roll/save metadata (META) and passive active effects (AES) to an
    item based on its (class, name). Official items keep their own metadata
    unless META overrides it; META entries mirror the official module pattern.
    """
    name = item["name"]
    meta = META.get((cls, name))
    if meta:
        for key, value in meta.items():
            if key == "save":
                item["system"]["save"] = value
            else:
                item["system"][key] = value
    changes = AES.get((cls, name))
    if changes:
        item["effects"] = [make_effect(name, changes)]


# ---------------------------------------------------------------- Sage
SAGE_FEATURES = [
    ("Precise Strikes",
     "The Sage may apply their Intelligence modifier to attack and damage "
     "rolls with weapons they are proficient in, representing precise "
     "application of anatomical or mechanical knowledge."),
    ("Sage Skills",
     "The Sage uses a set of percentile skills, progressed in the same manner "
     "as the Thief's. At 1st level: Lore 25%, Observation 20%, Medicine 20%, "
     "Appraisal 10%, Craft 10%. The player distributes 4 increases among these "
     "skills (+15% each), with no more than two increases in the same skill at "
     "level 1. On each new level the Sage gains 2 additional increases, with no "
     "more than one increase per skill per level. All skills cap at 85% "
     "(reached after 5 increases). Skills: Lore (identify monsters, items, "
     "terrain; reveals history, properties, and a minor exploit granting +1 to "
     "one check), Observation (study a foe in combat to reveal a weakness, "
     "granting allies bonuses to hit and damage), Medicine (treat wounds or "
     "stabilize the dying, lowering the damaging effect to Constitution), "
     "Appraisal (value gems, art, gear; detect forgeries or non-magical traps; "
     "chance to notice hidden compartments), Craft (build or repair tools and "
     "gadgets). These are class-exclusive Heroic checks; others attempt related "
     "ability checks at penalties."),
    ("Broad Knowledge",
     "The Sage has access to the general skill system from Rules Cyclopedia "
     "(pg. 81-86) and begins with the standard number of blank skill slots. The "
     "Sage gains additional blank skill slots every 2 levels (2, 4, 6, 8, 10, "
     "etc.) which may only be filled with knowledge-based or Lore skills: "
     "Science, History, Engineering, Knowledge, Art, Healing, Nature, or any "
     "other purely intellectual skill approved by the DM. Bonus slots do not "
     "count toward standard character limits."),
    ("Erudite Sense",
     "The Sage may concentrate for one turn (10 minutes) on a held item or a "
     "30-foot area. Roll the Lore skill. On success, the Sage gains non-magical "
     "information about the subject (history, properties, construction) and a "
     "hint toward a minor exploit if applicable."),
    ("Keen Observation",
     "In combat, the Sage may take a standard action to study an enemy, rolling "
     "the Observation skill against the target's Hit Dice or equivalent rank. "
     "On success, the Sage reveals a vulnerability, granting listed benefits to "
     "all allies attacking that target. Levels 1-4: 1 use per encounter, 1 foe, "
     "+1 to attack (1 round per Sage level) plus minor exploit. Levels 5-8: 2 "
     "uses, up to 2 foes, +1 attack and +1 damage (2 rounds per level) plus "
     "minor exploit. Level 9+: 3 uses, a group (up to Sage level in HD), +1 "
     "attack and +2 damage (3 rounds per level) plus major exploit. At 9th "
     "level the Sage gains a free passive observation once per turn on any foe "
     "engaged or clearly viewed (no action required)."),
    ("Medical Prowess",
     "The Sage performs first aid and stabilization as any character (one turn "
     "of post-combat aid or within one minute of injury). When the Sage "
     "attempts stabilization on a dying character: roll the Medicine skill "
     "percentile. On success, the target's Constitution check against death "
     "gains +1 (+2 at 5th level, +3 at 9th level); the Sage halves the target's "
     "Constitution recovery time and restores 1d3 hit points. On failure, "
     "standard first aid applies. Once per day per creature; stacks with other "
     "healing effects."),
    ("Research (Downtime)",
     "While in a settlement with access to libraries or archives, the Sage may "
     "spend one week and 100 gp per their level in research. Roll the Lore "
     "skill (or an appropriate RC general skill). On success, the Sage uncovers "
     "useful secrets, rumors, or maps relevant to the campaign, plus a potential "
     "exploit hook."),
    ("Workshop (Downtime)",
     "With access to basic tools and materials, the Sage may spend one week and "
     "500 gp per their level crafting a gadget or tool. Roll the Craft skill. "
     "On success, the item functions as intended (caltrops, smoke vial, "
     "reinforced rope). At 5th level and higher, workshop crafts are reliable "
     "(automatic success on standard items)."),
    ("Savant (9th Level)",
     "The Sage becomes a master advisor. Once per encounter, the Sage may rally "
     "allies with words of wisdom, granting +1 to saving throws and Morale "
     "checks for 1d6 rounds."),
]


# ---------------------------------------------------------------- build
def main():
    official = load_official_abilities()
    homebrew = load_homebrew()
    homebrew_classes = homebrew.get("classes", {})

    folders = []   # {_id, name, folder (parent id), type, sorting, color}
    items = []     # {_id, name, type, img, effects, folder, sort, flags, system, ownership, _stats}

    root_id = new_id()
    folders.append({
        "_id": root_id, "name": "Reforged Class Features", "folder": None,
        "type": "Item", "sorting": "a", "color": "#8a2be2", "sort": 0,
        "flags": {},
    })

    class_folder_ids = {}
    tier_folder_ids = {}

    for tier_name, class_keys in TIERS.items():
        tier_id = new_id()
        tier_folder_ids[tier_name] = tier_id
        folders.append({
            "_id": tier_id, "name": tier_name, "folder": root_id,
            "type": "Item", "sorting": "a", "color": "#5b2c8f", "sort": 0,
            "flags": {},
        })
        for cls in class_keys:
            cls_id = new_id()
            class_folder_ids[cls] = cls_id
            folders.append({
                "_id": cls_id, "name": CLASS_DISPLAY.get(cls, cls.title()),
                "folder": tier_id, "type": "Item", "sorting": "a",
                "color": "#cfa31b", "sort": 0, "flags": {},
            })

    # ---- per-class item assembly
    for tier_name, class_keys in TIERS.items():
        for cls in class_keys:
            cls_folder = class_folder_ids[cls]
            cls_display = CLASS_DISPLAY.get(cls, cls.title())
            hb = homebrew_classes.get(cls)
            official_items = official.get(cls, [])

            # removals per house rules doc
            removed_names = set(REMOVALS.get(cls, []))

            # index official items by name
            by_name = {it["name"]: it for it in official_items}

            modified_ids = set()  # official _ids consumed by a modification

            # 1) modifications: rewrite existing official items in place
            if hb and hb.get("modifications"):
                for mod in hb["modifications"]:
                    src_name = mod.get("compendiumName", "")
                    new_name = mod.get("newName", src_name)
                    new_text = mod.get("newText", "")
                    icon = mod.get("icon")
                    official_item = by_name.get(src_name)
                    if official_item and src_name not in removed_names:
                        modified_ids.add(official_item["_id"])
                        official_item["name"] = new_name
                        official_item["system"]["description"] = para(new_text)
                        if icon:
                            official_item["img"] = icon
                        official_item["flags"] = {
                            "ose-apo-reforged-rules": {"origin": "modified"}
                        }
                        official_item["_stats"] = {
                            "systemId": "ose", "systemVersion": "2.3.0",
                            "coreVersion": "14.359", "createdTime": None,
                            "modifiedTime": None, "lastModifiedBy": "apoapostolov",
                        }
                        official_item.pop("_key", None)
                        official_item.pop("folder", None)
                        items.append({**official_item, "folder": cls_folder, "sort": 0})
                    else:
                        # modification references a feature absent from the
                        # official compendium -> add it as a new ability
                        items.append({
                            **make_item(new_name, new_text, icon, cls, "modified"),
                            "folder": cls_folder,
                        })

            # 2) standard official items (kept unless removed or modified)
            for it in official_items:
                if it["_id"] in modified_ids or it["name"] in removed_names:
                    continue
                it["flags"] = {"ose-apo-reforged-rules": {"origin": "standard"}}
                it.pop("folder", None)
                it.pop("_key", None)  # CLI strips _key; foundry doesn't expect it in pack values
                items.append({**it, "folder": cls_folder, "sort": 0})

            # 3) new homebrew abilities
            if hb and hb.get("newAbilities"):
                for ab in hb["newAbilities"]:
                    items.append({
                        **make_item(ab["name"], ab.get("text", ""), ab.get("icon"),
                                    cls, "new"),
                        "folder": cls_folder,
                    })

            # 4) Sage (from OSE_NEW_CONTENT.md)
            if cls == "sage":
                for name, text in SAGE_FEATURES:
                    items.append({
                        **make_item(name, text, SAGE_ICON, "sage", "new"),
                        "folder": cls_folder,
                    })

            # 5) apply roll/save metadata + passive active effects for this class
            for it in items:
                if it.get("folder") == cls_folder:
                    apply_meta_and_aes(it, cls)

    manifest = {
        "folders": folders,
        "items": items,
        "summary": {
            "folders": len(folders),
            "items": len(items),
            "per_class": {
                cls: sum(1 for it in items if it.get("folder") == class_folder_ids[cls])
                for cls in class_folder_ids
            },
        },
    }
    with open(OUT_MANIFEST, "w") as f:
        json.dump(manifest, f, indent=1)

    print("manifest written:", OUT_MANIFEST)
    print("folders:", len(folders), "items:", len(items))
    for cls, count in manifest["summary"]["per_class"].items():
        print(f"  {cls:12s} {count}")


if __name__ == "__main__":
    main()
