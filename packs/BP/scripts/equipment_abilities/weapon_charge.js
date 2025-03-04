import { world, system } from '@minecraft/server';
import { stopTimeout } from "./stop_timeout.js";
import { getItemType, getTagName, getScore } from '../basic_functions.js';
import { weaponAttributes, getWeaponIndex } from "../equipment_attributes/weapons.js";
import { listOfEquipmentTypes } from "../equipment_attributes/list_of_equipment_types.js";
import { loopIds } from "../Main.js";

const chargeBars = ["", "", "", "", "", "", "", "", "", "", ""];

function weaponCharge(player, itemStack) {
    if(player.hasTag(getTagName(itemStack, "abilityCooldown:"))) { 
        const cooldown = world.scoreboard.getObjective("ability_cooldown").getScore(player)/20;
        player.onScreenDisplay.setActionBar(`On Cooldown: §c${cooldown} §rsec`);
        console.warn("on cooldown");
        return; 
    }
    stopTimeout(player, "reverseCharge");
    const index = getWeaponIndex(getItemType(itemStack));
    player.addTag(getTagName(itemStack, "charge:"));
    const id = system.runInterval(() => {
        if(getScore(player, "weapon_charge")/weaponAttributes[index].ability.chargeDuration < 1) { world.scoreboard.getObjective("weapon_charge").addScore(player, 1); }
        const chargeScore = getScore(player, "weapon_charge");
        const chargeBarIndex = Math.round(chargeScore/weaponAttributes[index].ability.chargeDuration*10);  //goes from 0 to 10
        player.onScreenDisplay.setActionBar(chargeBars[chargeBarIndex]);
    });
    loopIds.push({entityId: player.id, loopId: id, type: "charge"});
}

function weaponReverseCharge(player, itemStack) {
    const index = getWeaponIndex(getItemType(itemStack));
    const id = system.runInterval(() => {
        if(getScore(player, "weapon_charge") > 0) { world.scoreboard.getObjective("weapon_charge").addScore(player, -1); }
        else { 
            stopTimeout(player, "reverseCharge");
            system.clearRun(id);
        }
        const chargeScore = getScore(player, "weapon_charge");
        const chargeBarIndex = Math.floor(chargeScore/weaponAttributes[index].ability.chargeDuration*10);  //goes from 0 to 10
        player.onScreenDisplay.setActionBar(chargeBars[chargeBarIndex]);
    });
    loopIds.push({entityId: player.id, loopId: id, type: "reverseCharge"});
}

world.afterEvents.itemStopUse.subscribe((eventData) => {
    const entity = eventData.source;
    const itemStack = eventData.itemStack;
    if(itemStack === undefined) { return; } //happens when going through a nether portal (probably end portal too)
    if(!entity.hasTag(getTagName(itemStack, "charge:"))) { return; }
    console.warn("stopped");
    stopTimeout(entity, "charge", [getTagName(itemStack, "charge:")]);
    const index = getWeaponIndex(getItemType(itemStack));
    const chargeScore = getScore(entity, "weapon_charge");
    if(chargeScore/weaponAttributes[index].ability.chargeDuration === 1) { 
        for(var i=0; i<listOfEquipmentTypes.weapons.length; i++) {
            if(listOfEquipmentTypes.weapons[i].type === getItemType(itemStack)) {
                listOfEquipmentTypes.weapons[i].ability(entity, itemStack);
                break;
            }
        }
        world.scoreboard.getObjective("weapon_charge").setScore(entity, 0);
    }
    else {
        weaponReverseCharge(entity, itemStack);
    }
});

export { weaponCharge };