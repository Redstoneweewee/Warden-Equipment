import { system, world, BlockPermutation } from "@minecraft/server";
import { playSoundDynamic } from "../basic_functions";

world.afterEvents.entitySpawn.subscribe(async (eventData) => {
    const entity = eventData.entity;
    const itemName = (entity.getComponent("minecraft:item")?.itemStack?.typeId ?? "");
    if(entity.typeId !== "minecraft:item" || itemName !== "yes:aetherium_crystal") { return; }
    let lavaCauldronTick = 0;
    system.runInterval(() => {
        if(!entity.isValid()) { return; }
        const block = entity.dimension.getBlock(entity.location) ?? undefined;
        if(block.matches("minecraft:cauldron", {cauldron_liquid: "lava", fill_level: 6})) {
            lavaCauldronTick++;
            entity.dimension.spawnParticle("minecraft:lava_particle", entity.location);
            playSoundDynamic(entity, "random.fizz", 16);
            if(lavaCauldronTick >= 40) {
                entity.dimension.spawnEntity("yes:aetherite_ingot_transform", entity.location);
                block.setPermutation(BlockPermutation.resolve(block.typeId, {fill_level: 0}));
                lavaCauldronTick = 0;
            }
        }
        else if(lavaCauldronTick > 0) {
            lavaCauldronTick = 0;
        }
    });
});