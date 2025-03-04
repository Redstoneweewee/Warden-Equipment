import { weaponAbilities } from "../equipment_abilities/weapons.js";
import { armorAbilities } from "../equipment_abilities/armor.js";
import { weaponCharge } from "../equipment_abilities/weapon_charge.js";
import { nexusBowStopAbility } from "../equipment_abilities/nexus.js";

export const listOfEquipmentTypes = {
    weapons: [
        {
            type: "hammer",
            ability: weaponAbilities.hammerAbility
        },
        {
            type: "spear",
            ability: weaponAbilities.spearAbility
        },
        {
            type: "dagger",
            hitAbility: weaponAbilities.daggerHitAbility
        },
        {
            type: "whip",
            ability: weaponAbilities.whipAbility
        },
        {
            type: "battleaxe",
            ability: weaponAbilities.battleaxeAbility
        },
        {
            type: "greatsword",
            hitAbility: weaponAbilities.greatswordHitAbility
        },
        {
            type: "morningstar",
            charge: weaponCharge,
            hitAbility: weaponAbilities.morningstarHitAbility,
            ability: weaponAbilities.morningstarAbility
        },
        {
            type: "scythe",
            charge: weaponCharge,
            hitAbility: weaponAbilities.scytheHitAbility,
            ability: weaponAbilities.scytheAbility
        },
        {
            type: "echo_staff",
            ability: weaponAbilities.echoStaffAbility,
            additionalFunctions: {
                removeEntities: [
                    "yes:echo_staff_random_tp_entity",
                    "yes:echo_staff_sonic_boom_entity"
                ]
            }
        },
        {
            type: "nexus_bow",
            ability: weaponAbilities.nexusBowHitAbility,
            additionalFunctions: {
                removeFunction: nexusBowStopAbility
            }
        },
        //{
        //    type: "katana",
        //    ability: weaponAbilities.katanaAbility
        //},
    ],
    armor: [
        {
            type: "copper_armor",
            ability: armorAbilities.copperArmorAbility,
            stopAbility: armorAbilities.stopCopperArmorAbility
        },
        {
            type: "phantom_armor",
            ability: armorAbilities.phantomArmorAbility,
            stopAbility: armorAbilities.stopPhantomArmorAbility
        },
        {
            type: "glowing_obsidian_armor",
            ability: armorAbilities.glowingObsidianArmorAbility,
            stopAbility: armorAbilities.stopGlowingObsidianArmorAbility
        },
        {
            type: "nexus_armor",
            ability: armorAbilities.nexusArmorAbility,
            stopAbility: armorAbilities.stopNexusArmorAbility
        },
        {
            type: "warden_armor",
            ability: armorAbilities.wardenArmorAbility,
            stopAbility: armorAbilities.stopWardenArmorAbility
        },
        {
            type: "aetherite_armor",
            ability: armorAbilities.aetheriteArmorAbility,
            stopAbility: armorAbilities.stopAetheriteArmorAbility
        },
        {
            type: "gilded_netherite_armor",
            ability: armorAbilities.gildedNetheriteArmorAbility,
            stopAbility: armorAbilities.stopGildedNetheriteArmorAbility
        },
        {
            type: "reaper_armor",
            ability: armorAbilities.reaperArmorAbility,
            stopAbility: armorAbilities.stopReaperArmorAbility
        }
    ]
}