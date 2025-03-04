import { world } from "@minecraft/server";
import { playSoundDynamic } from "../basic_functions";

world.afterEvents.entitySpawn.subscribe(async (eventData) => {
    const entity = eventData.entity;
    if(entity.typeId !== "yes:reaper_skeleton") { return; }
    entity.dimension.spawnParticle("yes:reaper_spawn_particle", entity.location);
    playSoundDynamic(entity, "mob.reaper_skeleton_spawn_weewee", 30, 0.8, 1.5);
});