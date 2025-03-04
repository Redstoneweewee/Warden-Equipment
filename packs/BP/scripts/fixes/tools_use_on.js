import { world, system, BlockPermutation } from '@minecraft/server';
import { applyDurabilityDamage } from '../basic_functions.js';

//--- portions of this code was created by t17x and modified by Warden
world.beforeEvents.itemUseOn.subscribe(async (eventData) => {
    const block = eventData.block;
    const itemStack = eventData.itemStack;
    const player = eventData.source;

    if(itemStack?.hasTag("minecraft:is_axe")) {
        if (!axeBlocks.includes(block?.typeId)) { return; }
        system.run(() => {
            player.playSound("use.wood", player.location);
            applyDurabilityDamage(player, itemStack, "Mainhand", 1);
        });
    }
    else if(itemStack?.hasTag("minecraft:is_shovel")) {
        if (!shovelBlocks.includes(block?.typeId)) { return; }
        system.run(() => {
            player.playSound("use.grass", player.location);
            block.setPermutation(BlockPermutation.resolve("minecraft:grass_path"));
            applyDurabilityDamage(player, itemStack, "Mainhand", 1);
        });
    }
    else if(itemStack?.hasTag("minecraft:is_hoe")) {
        if (!hoeBlocks.includes(block?.typeId)) { return; }
        system.run(() => {
            player.playSound("use.gravel", player.location);
            applyDurabilityDamage(player, itemStack, "Mainhand", 1);
        });
    }
});

//Block Type Ids For Axe Function
const axeBlocks = [
    "minecraft:oak_log",
    "minecraft:spruce_log",
    "minecraft:birch_log",
    "minecraft:jungle_log",
    "minecraft:acacia_log",
    "minecraft:dark_oak_log",
    "minecraft:mangrove_log",
    "minecraft:cherry_log",
    "minecraft:bamboo_block",
    "minecraft:crimson_stem",
    "minecraft:warped_stem",
    "minecraft:oak_wood",
    "minecraft:spruce_wood",
    "minecraft:birch_wood",
    "minecraft:jungle_wood",
    "minecraft:acacia_wood",
    "minecraft:dark_oak_wood",
    "minecraft:mangrove_wood",
    "minecraft:cherry_wood",
    "minecraft:crimson_hyphae",
    "minecraft:warped_hyphae"
    //add more...
  ];
  
  //Block Type Ids For Shovel Function
  const shovelBlocks = [
    "minecraft:dirt",
    "minecraft:grass_block",
    "minecraft:course_dirt",
    "minecraft:dirt_with_roots",
    "minecraft:podzol",
    "minecraft:mycelium"
    //add more...
  ];
  
  //Block Type Ids For Hoe Function
  const hoeBlocks = [
    "minecraft:dirt",
    "minecraft:grass_block",
    "minecraft:grass_path",
    "minecraft:course_dirt",
    "minecraft:dirt_with_roots"
    //add more...
  ];
//---