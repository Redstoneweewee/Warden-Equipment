import { world } from "@minecraft/server";

world.afterEvents.entitySpawn.subscribe(async (eventData) => {
    const entity = eventData.entity;
    if(!(entity.getComponent("minecraft:item")?.itemStack ?? false)) { return; }
    if(entity.getComponent("minecraft:item")?.itemStack.hasTag("minecraft:fire_immune")) { 
        entity.addTag("unburnable");
    }
});