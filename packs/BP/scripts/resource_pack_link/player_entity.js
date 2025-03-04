import { system, world } from "@minecraft/server";
import { getEntities, getScore, removeCustomEntity } from "../basic_functions";

const initialId = system.runInterval(() => {
    if(getEntities("yes:player_entity").length !== 0) {
        getEntities("yes:player_entity").forEach(entity => {playerEntityFunction(entity);});
        system.clearRun(initialId);
        return;
    }
});
world.afterEvents.entitySpawn.subscribe(async (eventData) => {
    const entity = eventData.entity;
    if(entity.typeId !== "yes:player_entity") { return; }
    playerEntityFunction(entity);
})
world.afterEvents.entityLoad.subscribe(async (eventData) => {
    const entity = eventData.entity;
    if(entity.typeId !== "yes:player_entity") { return; }
    playerEntityFunction(entity);
})

function playerEntityFunction(playerEntity) {
    const loopId = system.runInterval(() => {
        const owningIdentifier = getScore(playerEntity, "owning_identifier");
        const owningPlayer = world.getPlayers({scoreOptions: [{objective: "identifier", maxScore: owningIdentifier, minScore: owningIdentifier}]})[0];
        if(!playerEntity.isValid()) { system.clearRun(loopId); return; }
        if(owningPlayer === undefined || !owningPlayer.isValid()) { removeCustomEntity(playerEntity); system.clearRun(loopId); return; }
        const playerEntities = playerEntity.dimension.getEntities({type: "yes:player_entity", scoreOptions:[{objective: "owning_identifier", minScore: owningIdentifier, maxScore: owningIdentifier}]});
        if(playerEntities instanceof Array && playerEntities.length > 1) {
            removeCustomEntity(playerEntities[1]);
        }
        const l = playerEntity.location;
        const pL = owningPlayer.location;
        const distance = Math.sqrt((pL.x-l.x)**2+(pL.y-l.y)**2+(pL.z-l.z)**2);
        if(distance > 5) {
            owningPlayer.getComponent("minecraft:rideable").ejectRiders();
            owningPlayer.getComponent("minecraft:rideable").addRider(playerEntity);
        }
    }, 20);
}