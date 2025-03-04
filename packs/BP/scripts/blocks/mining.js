import { world, BlockPermutation, system } from "@minecraft/server";
import { customBlocks } from "./custom_blocks_list";
import { pickaxeSpeeds, efficiencySpeeds } from "./pickaxes_list";
import { pickaxeTags } from "./pickaxe_tags_list";
import { spawnItem, isCreative } from "../basic_functions";

export function mining(block, itemStack) {
    let cont = false;
    let tags = [];
    for(let i in customBlocks) {
        if(block.typeId === customBlocks[i].typeId) { 
            if(customBlocks[i].tag ?? false) {
                for(let j in pickaxeTags) {
                    if(customBlocks[i].tag === pickaxeTags[j].tag) { tags = pickaxeTags[j].contains; }
                }
            }
            cont = true; 
            break;
        }
    }
    if(!cont) { return; }
    const efficiencyLevel = itemStack !== undefined ? (itemStack.getComponent("minecraft:enchantable")?.getEnchantment("efficiency")?.level ?? 0) : 0;
    let speed = 1;
    let efficiencyAdd = 0;
    let harvestable = false;
    if(itemStack !== undefined) {
        for(let i in efficiencySpeeds) {
            if(efficiencyLevel === efficiencySpeeds[i].level) {
                efficiencyAdd = efficiencySpeeds[i].add;
                break;
            }
        }
        for(let i in pickaxeSpeeds) {
            if(itemStack.typeId === pickaxeSpeeds[i].typeId) {
                speed = pickaxeSpeeds[i].speed + efficiencyAdd;
                if(tags.includes(pickaxeSpeeds[i].tag)) { harvestable = true; }
                break;
            }
        }
        if(itemStack.typeId.split(":")[0] !== "minecraft" && itemStack.typeId.split(":")[0] !== "yes") {
            block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': true, 'yes:speed1': 8+efficiencyAdd, 'yes:speed2': 0, 'yes:speed3': 0, })); //assume that all pickaxes from other addons have a base speed of 8
        }
        else if(!harvestable) {
            block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': harvestable, 'yes:speed1': 0, 'yes:speed2': 0, 'yes:speed3': 0, }));
        }
        else if(harvestable && speed <= 15) {
            block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': harvestable, 'yes:speed1': speed, 'yes:speed2': 0, 'yes:speed3': 0, }));
        }
        else if(harvestable && speed >= 16 && speed <= 30) {
            block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': harvestable, 'yes:speed1': 0, 'yes:speed2': speed, 'yes:speed3': 0, }));
        }
        else if(harvestable && speed >= 31 && speed <= 41) {
            block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': harvestable, 'yes:speed1': 0, 'yes:speed2': 0, 'yes:speed3': speed, }));
        }
    }
    else {
        block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': false, 'yes:speed1': 0, 'yes:speed2': 0, 'yes:speed3': 0, }));
    }
    //console.warn(`hit custom block, harvestable: ${harvestable}, speed: ${speed}`);
}

/*
world.afterEvents.entityHitBlock.subscribe(async (eventData) => {
    const block = eventData.hitBlock;
    const player = eventData.damagingEntity;
    let cont = false;
    let tags = [];
    for(let i in customBlocks) {
        if(block.typeId === customBlocks[i].typeId) { 
            if(customBlocks[i].tag ?? false) {
                for(let j in pickaxeTags) {
                    if(customBlocks[i].tag === pickaxeTags[j].tag) { tags = pickaxeTags[j].contains; }
                }
            }
            cont = true; 
            break;
        }
    }
    if(!cont) { return; }

    const itemStack = player.getComponent('minecraft:inventory').container.getSlot(player.selectedSlotIndex).getItem();
    const efficiencyLevel = itemStack !== undefined ? (itemStack.getComponent("minecraft:enchantable")?.getEnchantment("efficiency")?.level ?? 0) : 0;
    let speed = 1;
    let efficiencyAdd = 0;
    let harvestable = false;
    if(itemStack !== undefined) {
        for(let i in efficiencySpeeds) {
            if(efficiencyLevel === efficiencySpeeds[i].level) {
                efficiencyAdd = efficiencySpeeds[i].add;
                break;
            }
        }
        for(let i in pickaxeSpeeds) {
            if(itemStack.typeId === pickaxeSpeeds[i].typeId) {
                speed = pickaxeSpeeds[i].speed + efficiencyAdd;
                if(tags.includes(pickaxeSpeeds[i].tag)) { harvestable = true; }
                break;
            }
        }
        if(itemStack.typeId.split(":")[0] !== "minecraft" && itemStack.typeId.split(":")[0] !== "yes") {
            block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': true, 'yes:speed1': 8+efficiencyAdd, 'yes:speed2': 0, 'yes:speed3': 0, })); //assume that all pickaxes from other addons have a base speed of 8
        }
        else if(!harvestable) {
            block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': harvestable, 'yes:speed1': 0, 'yes:speed2': 0, 'yes:speed3': 0, }));
        }
        else if(harvestable && speed <= 15) {
            block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': harvestable, 'yes:speed1': speed, 'yes:speed2': 0, 'yes:speed3': 0, }));
        }
        else if(harvestable && speed >= 16 && speed <= 30) {
            block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': harvestable, 'yes:speed1': 0, 'yes:speed2': speed, 'yes:speed3': 0, }));
        }
        else if(harvestable && speed >= 31 && speed <= 41) {
            block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': harvestable, 'yes:speed1': 0, 'yes:speed2': 0, 'yes:speed3': speed, }));
        }
    }
    else {
        block.setPermutation(BlockPermutation.resolve(block.typeId, { 'yes:harvestable': false, 'yes:speed1': 0, 'yes:speed2': 0, 'yes:speed3': 0, }));
    }
    console.warn(`hit custom block, harvestable: ${harvestable}, speed: ${speed}`);
});
*/

world.beforeEvents.playerBreakBlock.subscribe(async (eventData) => {
    const player = eventData.player;
    if(isCreative(player)) { return; }
    const block = eventData.block;
    let cont = false;
    for(let i in customBlocks) {
        if(block.typeId === customBlocks[i].typeId) { 
            cont = true; 
            break;
        }
    }
    if(!cont) { return; }
    console.warn("broke custom block");
    const itemName = block.typeId;
    const itemStack = eventData.itemStack;
    const blockPremutation = block.permutation;
    const location = block.location;

    const harvestable = blockPremutation.getState(`yes:harvestable`);
    const silkTouch = itemStack !== undefined ? (itemStack.getComponent("minecraft:enchantable")?.getEnchantment("silk_touch")?.level ?? 0) : 0;
    const tags = block.getTags();
    let loot = "none";
    let silkTouchLoot = "none"; //not used for now
    let xpDrop = 0;
    let fortuneLevelMultiplier = 0;  //not used for now
    tags.forEach(tag => {
        if     (tag.split(":")[0] === "loot")                   { loot = tag.split(":")[1]; }
        else if(tag.split(":")[0] === "silkTouchLoot")          { silkTouchLoot = tag.split(":")[1]; }
        else if(tag.split(":")[0] === "xpDrop")                 { xpDrop = parseInt(tag.split(":")[1]); }
        else if(tag.split(":")[0] === "fortuneLevelMultiplier") { fortuneLevelMultiplier = parseInt(tag.split(":")[1]); }
    });
    system.run(() => {
        if(harvestable) {
            if(silkTouch) {
                //player.runCommandAsync(`loot spawn ${location.x+0.5} ${location.y+0.5} ${location.z+0.5} loot "blocks/${silkTouchLoot}"`);
                //silk touch pickaxes automatically drop the block without the need of scripts
                console.warn("silk touch");
            }
            else {
                player.runCommandAsync(`loot spawn ${location.x+0.5} ${location.y+0.5} ${location.z+0.5} loot "blocks/${loot}"`);
                for(let i=0; i<xpDrop; i++) {
                    player.dimension.spawnEntity("minecraft:xp_orb", location);
                }
            }
        }
    });
});

world.beforeEvents.explosion.subscribe(async (evenData) => {
    const blocks = evenData.getImpactedBlocks();
    const dimension = evenData.dimension;
    blocks.forEach(block => {
        let cont = false;
        for(let i in customBlocks) {
            if(block.typeId === customBlocks[i].typeId) { 
                cont = true; 
                break;
            }
        }
        if(!cont) { return; }
        const location = block.location;
        const tags = block.getTags();
        let loot = "none";
        let xpDrop = 0;
        tags.forEach(tag => {
            if(tag.split(":")[0] === "loot")        { loot = tag.split(":")[1]; }
            else if(tag.split(":")[0] === "xpDrop") { xpDrop = parseInt(tag.split(":")[1]); }
        });
    system.run(() => {
            dimension.runCommandAsync(`loot spawn ${location.x+0.5} ${location.y+0.5} ${location.z+0.5} loot "blocks/${loot}"`);
            for(let i=0; i<xpDrop; i++) {
                dimension.spawnEntity("minecraft:xp_orb", location);
            }
        });
    });
});