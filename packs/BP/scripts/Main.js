import "./custom_components/initialization.js";
import "./initialize_scoreboards.js";
import "./tick.js";
import "./despawn_custom_entities.js";
import "./fixes/scoreboard_dimension_change.js";
import "./fixes/tools_use_on.js";
import "./fixes/burn_prevention.js";
import "./fixes/dimension_change.js";
import "./equipment_abilities/gilded_netherite.js";
import "./blocks/mining.js";
import "./resource_pack_link/player_entity.js";
import "./entities/entities.js";
import "./items/items.js";
//import "./fixes/weapons_stop_attack.js";

import { world, system, ItemStack, EffectTypes, Block } from '@minecraft/server';
import * as sysVar from "./system_variables.js";
import { scoreboardList } from "./initialize_scoreboards.js";
import { setIdentifier, getScore, getItemType, getArmorType, applyAbilityDamage, getTagName, getAllEquipment, isCreative, spawnCustomEntity, setOwningIdentifier, removeCustomEntity } from "./basic_functions.js";
import { stopTimeout, additionalFunctions } from "./equipment_abilities/stop_timeout.js";
import { greatswordInitialize, greatswordStop } from "./equipment_abilities/greatsword.js";
import { listOfEquipmentTypes } from "./equipment_attributes/list_of_equipment_types.js";
import { resetPlayer } from "./reset.js";
import { mining } from "./blocks/mining.js";
import { headRotationLinkFunction } from "./resource_pack_link/head_rotation.js";
import { setNormalLevel } from "./resource_pack_link/xp_level.js";
import { craftingKeepEnchantments, addPlayerEnchantedItems, removePlayerEnchantedItems } from "./crafting/keep_enchantments.js";

/** loopIds is an array of loop id objects, used primarily to stop loops or timeouts from anywhere.
 * @example
 * [
 *   {
 *      entityId: 1234567890,
 *      loopId: 1,
 *      type: "ability"
 *   },
 *   etc.
 * ]
 */
var loopIds = []; 
var systemLoopIds = []; 
/*
var listOfAllEquipmentTypes = [];
listOfEquipmentTypes.weapons.forEach(e => {
    listOfAllEquipmentTypes.push(e.type);
});
listOfEquipmentTypes.armor.forEach(e => {
    listOfAllEquipmentTypes.push(e.type);
});
*/

/** Necessary to make sure the playerFunction() function runs on /reload. Should not run on first load of the world.
 */
let functionRanAlready = false;
const initialId = system.runInterval(() => {
    if(functionRanAlready) {
        system.clearRun(initialId);
        return;
    }
    if(world.getAllPlayers().length !== 0) {
        world.getAllPlayers().forEach(player => {playerFunction(player);});
        functionRanAlready = true;
        system.clearRun(initialId);
        return;
    }
});
world.afterEvents.playerSpawn.subscribe(async (eventData) => {
    const player = eventData.player;
    if(eventData.initialSpawn && (!functionRanAlready || world.getAllPlayers().length > 1)) {
        playerFunction(player);
        functionRanAlready = true;
    }
});

function playerFunction(player) {
    if(!player.isValid()) { removePlayerEnchantedItems(player); return; }
    sysVar.addSystemVariables(player);
    console.warn("started player function loop");
    scoreboardList.forEach(scoreboard => {
        if(getScore(player, scoreboard) === undefined) { world.scoreboard.getObjective(scoreboard).addScore(player, 0); }
    });
    if(getScore(player, "identifier") === 0) { setIdentifier(player); }
    const identifier = getScore(player, "identifier");
    resetPlayer(player, "reload");
    addPlayerEnchantedItems(player);
    var xpLink = false;
    //var oldItemStack = player.getComponent('minecraft:inventory').container.getSlot(player.selectedSlotIndex).getItem();
    var oldNearPortal = false;
    var nearPortal = false;
    
    const portalTestLoopId = system.runInterval(() => {
        if(!player.isValid()) { stopSystemLoop(player, "portalTestLoop"); return; }
        
        nearPortal = false;
        const dimension = player.dimension;
        const radius = 3;
        const blockList = ["minecraft:portal", "minecraft:end_portal", "minecraft:end_gateway"];
        const pl = player.location;
        //let foundBlocks = [];
        
        loop: for (let x = pl.x - radius; x <= pl.x + radius; x++) {
            for (let y = pl.y; y <= pl.y; y++) {
                for (let z = pl.z - radius; z <= pl.z + radius; z++) {
                    try {
                        const block = (dimension.getBlock({x: x, y: y, z: z}) ?? undefined);
                        if(!block) { continue; }
                        for(let i in blockList) {
                            if(block.matches(blockList[i])) {
                                nearPortal = true;
                                stopSystemLoop(player, "playerEntityLoop");
                                const playerEntity = player.dimension.getEntities({type:"yes:player_entity", scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]})[0];
                                player.getComponent("minecraft:rideable").ejectRiders();
                                removeCustomEntity(playerEntity);
                                //foundBlocks.push(`${block.typeId} at ${Math.floor(x)}, ${Math.floor(y)}, ${Math.floor(z)}`);
                                break loop;
                            }
                        }
                    }
                    catch (error) {
                        console.error(`Error detecting block at ${x}, ${y}, ${z}: ${error}`);
                    }
                }
            }
        }
        if(oldNearPortal && player.dimension !== sysVar.getSystemVariableValue(player, "dimension")) {
            sysVar.setSystemVariableValue(player, "dimensionLoaded", false);
        }
        if(!nearPortal && sysVar.getSystemVariableValue(player, "dimensionLoaded")) {
            for(let i in systemLoopIds) {
                if(systemLoopIds[i].type === "playerEntityLoop" && systemLoopIds[i].entityId === player.id) { break; }
                else if(i == systemLoopIds.length-1) { 
                    console.warn("spawning player entity");
                    playerEntityLoop(player, identifier); 
                }
            }
        }
        oldNearPortal = nearPortal;

        //if (foundBlocks.length > 0) {
        //    console.warn(`blocks found: ${foundBlocks.join(', ')}`);
        //} else {
        //    console.warn(`no blocks.`);
        //}
    }, 5);
    playerEntityLoop(player, identifier);
    const loopId = system.runInterval(() => { //runs every tick
        if(!player.isValid()) { 
            removePlayerEnchantedItems(player);
            sysVar.removeSystemVariables(player);
            stopSystemLoop(player, "systemLoop");
            return; 
        }
        if(player.hasTag("yes:dead") && !player.hasTag("yes:dead_activated")) { 
            resetPlayer(player, "death");
            player.addTag("yes:dead_activated");
        }
        const itemStack = player.getComponent('minecraft:inventory').container.getSlot(player.selectedSlotIndex).getItem();
        const itemType = getItemType(itemStack)??"";
        //---------- weapon abilities ----------
        listOfEquipmentTypes.weapons.forEach(obj => {
            const type = obj.type;
            const isAdditionalFunctions = obj.additionalFunctions ?? undefined;
            if(type !== itemType && player.hasTag(`ability:${type}`) && isAdditionalFunctions) { additionalFunctions(player, obj.additionalFunctions); }
            if(type !== itemType && player.hasTag(`ability:${type}`)) { stopTimeout(player, "ability", [`ability:${type}`]); }
        });
        if(itemType === "greatsword" && !player.hasTag("holding:greatsword")) { greatswordInitialize(player); }
        else if(itemType !== "greatsword" && player.hasTag("holding:greatsword")) { greatswordStop(player); }
        //--------------------------------------

        //---------- armor abilities ----------
        const equipment = getAllEquipment(player);
        if(!player.hasTag(`equipmentAbility:copper_armor`)) {
            for(let i in equipment) {
                if(equipment[i].item !== undefined && equipment[i].item.typeId.includes("copper") && equipment[i].item.typeId.includes("yes:") && !equipment[i].item.typeId.includes("oxidized") && !equipment[i].item.typeId.includes("waxed")) {
                    console.warn("started copper ability");
                    listOfEquipmentTypes.armor[0].ability(player);
                }
            }
        }
        listOfEquipmentTypes.armor.forEach(obj => {
            const type = obj.type;
            if(type === "copper_armor" && player.hasTag(`equipmentAbility:${type}`)) { 
                let hasCopperItem = false;
                for(let i in equipment) {
                    if(equipment[i].item !== undefined && equipment[i].item.typeId.includes("copper") && equipment[i].item.typeId.includes("yes:") && !equipment[i].item.typeId.includes("oxidized") && !equipment[i].item.typeId.includes("waxed")) {
                        hasCopperItem = true;
                        break;
                    }
                }
                if(!hasCopperItem) { obj.stopAbility(player); }
            }
            else if(player.hasTag(`armorAbility:${type}`)) {
                for(let i=0; i<4; i++) {
                    if(getArmorType(equipment[i].item) !== type) {
                        console.warn("stopped ability");
                        obj.stopAbility(player);
                        return;
                    }
                }
            }
            else if(type !== "copper_armor") {
                for(let i=1; i<4; i++) {
                    if(getArmorType(equipment[i].item) !== type || (getArmorType(equipment[0].item) !== getArmorType(equipment[i].item)) || getArmorType(equipment[i].item) === "") { 
                        //console.warn("does not have full set");
                        break; 
                    }
                    if(i === 3) {
                        console.warn("has full set first time");
                        obj.ability(player);
                    }
                }
            }
        });
        //-------------------------------------

        //---------- block & pickaxe destroy time ----------
        if(!isCreative(player)) {
            const blockRayCast = player.getBlockFromViewDirection({maxDistance: 12});
            if(blockRayCast !== undefined) {
                const blocks = [blockRayCast.block, blockRayCast.block.above(1)];
                blocks.forEach(block => {
                    mining(block, itemStack);
                });
            }
        }
        //--------------------------------------------------

        //---------- Resource pack link ----------
        headRotationLinkFunction(player, identifier);
        
        const oldExp = world.scoreboard.getObjective("exp").getScore(player);
        let exp = 0;
        const usingWeapon = player.hasTag("animation:weapon");
        let phantomWhip = world.scoreboard.getObjective("whip_animation").getScore(player);
        let phantomWhipBit = [0, 0, 0];
        if(phantomWhip-3 > 0) { phantomWhipBit[2] = 1; phantomWhip -= 4; }
        if(phantomWhip-1 > 0) { phantomWhipBit[1] = 1; phantomWhip -= 2; }
        if(phantomWhip   > 0) { phantomWhipBit[0] = 1; phantomWhip -= 1; }
        //const enderiteUpsideDown = world.scoreboard.getObjective("enderite_upsdwn").getScore(player);
        //const enderiteEnergy = world.scoreboard.getObjective("enderite_energy").getScore(player);
        //if(enderiteUpsideDown == 1) { exp  += Math.pow(2,4); }
        if(phantomWhipBit[2]  == 1) { exp  += Math.pow(2,3); }
        if(phantomWhipBit[1]  == 1) { exp  += Math.pow(2,2); }
        if(phantomWhipBit[0] == 1)  { exp  += Math.pow(2,1); }
        if(usingWeapon > 0)         { exp  += Math.pow(2,0); }
        if(exp != 0)                { exp  += Math.pow(2,14); }
        world.scoreboard.getObjective("exp").setScore(player, exp);
        if(exp !== 0 && xpLink === false) {
            const normalXp = player.getTotalXp();
            world.scoreboard.getObjective("xp_n").setScore(player, normalXp);
            xpLink = true;
            console.warn("1");
        }
        else if(exp === 0 && xpLink === true) {
            setNormalLevel(player);
            xpLink = false;
            console.warn("2");
        }
        if(oldExp !== exp && xpLink === true) {
            if(player.getTotalXp() != world.scoreboard.getObjective("xp_n").getScore(player)) {
                world.scoreboard.getObjective("xp_n").addScore(player, player.xpEarnedAtCurrentLevel);
                console.warn("3");
            }
            player.resetLevel();
            player.addLevels(exp);
        }
        //----------------------------------------

        //---------- crafting ----------
        //craftingKeepEnchantments(player);
        //------------------------------
    });
    systemLoopIds.push({entityId: player.id, loopId: portalTestLoopId, type: "portalTestLoop"});
    systemLoopIds.push({entityId: player.id, loopId: loopId, type: "systemLoop"});
}


function playerEntityLoop(player, identifier) {
    const id = system.runInterval(() => {
        if(!sysVar.getSystemVariableValue(player, "dimensionLoaded")) { return; }
        if(!player.isValid()) { stopSystemLoop(player, "playerEntityLoop"); return; }
        const playerEntity = player.dimension.getEntities({type:"yes:player_entity", scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]})[0];
        if(!player.hasTag("yes:dead")) {
            if(playerEntity === undefined) {
                const playerEntity = spawnCustomEntity("yes:player_entity", player);
                setOwningIdentifier(playerEntity, player);
                player.getComponent("minecraft:rideable").ejectRiders();
                player.getComponent("minecraft:rideable").addRider(playerEntity);
            }
        }
        else {
            if(playerEntity !== undefined) { 
                player.getComponent("minecraft:rideable").ejectRiders();
                removeCustomEntity(playerEntity); 
            }
        }
    }, 20);
    systemLoopIds.push({entityId: player.id, loopId: id, type: "playerEntityLoop"});
}



/**
 * Stops all system loops for a player from the `systemLoopIds` array.
 * @param {Player} player - The player that the loops belong to.
 * @param {String} [type] - The specific type of loop to be stopped. If nothing is passed, all system loops belong to the player will be removed.
 */
function stopSystemLoop(player, type) {
    if(type) {
        for(var i=systemLoopIds.length-1; i>=0; i--) {
            if(systemLoopIds[i].type === type && systemLoopIds[i].entityId === player.id) {
                system.clearRun(systemLoopIds[i].loopId);
                systemLoopIds.splice(i, 1);
                console.warn(`stopped system loop for ${player.isValid() ? player.name : "unknown player"} with type ${type}.`);  
            }
        }
    }
    else {
        for(var i=systemLoopIds.length-1; i>=0; i--) {
            if(systemLoopIds[i].entityId === player.id) {
                system.clearRun(systemLoopIds[i].loopId);
                systemLoopIds.splice(i, 1);
                console.warn(`stopped all system loops for ${player.isValid() ? player.name : "unknown player"}.`); 
            }
        } 
    }
    //console.warn(`stopped system loop for ${player.isValid() ? player.name : "unknown player"} with type ${type}.`); 
}

export { loopIds, systemLoopIds };

console.warn("Main.js ran with no errors");

//system.runInterval(() => {
//    let i = 0;
//    loopIds.forEach(obj => {
//        i++;
//        console.warn(`loopId [${i}]: ${obj.entityId}, ${obj.loopId}, ${obj.type}`);
//    });
//});

//system.runInterval(() => {
//    console.warn(systemLoopIds);
//});