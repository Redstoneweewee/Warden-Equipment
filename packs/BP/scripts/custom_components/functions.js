import { system } from "@minecraft/server";
import { getItemType, getTagName, applyDurabilityDamage } from "../basic_functions.js";
import { listOfEquipmentTypes } from "../equipment_attributes/list_of_equipment_types.js";

//item custom components
function miningDurabilityDamage(eventData) {
    const player = eventData.source;
    const itemStack = eventData.itemStack;
    const damage = 1;
    applyDurabilityDamage(player, itemStack, "Mainhand", damage);
}
function onUse(eventData) {
    const player = eventData.source;
    const itemStack = eventData.itemStack;
    if(itemStack.hasTag(getTagName(itemStack))) {
        for(var i=0; i<listOfEquipmentTypes.weapons.length; i++) {
            if(listOfEquipmentTypes.weapons[i].type === getItemType(itemStack)) {
                if(!itemStack.hasTag("yes:charge_weapon")) { listOfEquipmentTypes.weapons[i].ability(player, itemStack); }
                else { listOfEquipmentTypes.weapons[i].charge(player, itemStack); }
                break;
            }
        }
    }
}
function onHit(eventData) {
    const player = eventData.attackingEntity;
    const itemStack = eventData.itemStack;
    const target = eventData.hitEntity;
    if(itemStack.hasTag(getTagName(itemStack))) {
        for(var i=0; i<listOfEquipmentTypes.weapons.length; i++) {
            if(listOfEquipmentTypes.weapons[i].type === getItemType(itemStack)) {
                listOfEquipmentTypes.weapons[i].hitAbility(player, itemStack, target);
                break;
            }
        }
    }
}
function hitDurabilityDamage(eventData) {
    const player = eventData.attackingEntity;
    const itemStack = eventData.itemStack;
    const damage = 1;
    system.run(() => {
        applyDurabilityDamage(player, itemStack, "Mainhand", damage);
    });
}
//block custom components
/* unused until they add a beforeEvent
function onPlayerDestroy(eventData) {
    const player = eventData.player;
    const block = eventData.block;
    const blockPremutation = eventData.destroyedBlockPermutation;
    blockLoot(player, block, blockPremutation);
}
    */
//will add more functions as more custom components are used

export const functions = {
    miningDurabilityDamage: miningDurabilityDamage,
    onUse: onUse,
    onHit: onHit,
    hitDurabilityDamage: hitDurabilityDamage
    //onPlayerDestroy: onPlayerDestroy
};