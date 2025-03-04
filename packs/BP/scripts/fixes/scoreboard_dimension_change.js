import { world, system, ItemStack, EffectTypes } from '@minecraft/server';
import { scoreboardList } from "../initialize_scoreboards.js";
import { getScore } from "../basic_functions.js";

var scores = [];

world.beforeEvents.entityRemove.subscribe(async (eventData) => {
    const entity = eventData.removedEntity;
    if(entity.typeId === "minecraft:player" || !entity.hasTag("yes:keep_scoreboard")) return;
    const entityId = entity.id;
    scoreboardList.forEach(scoreboard => {
        var score;
        try { score = world.scoreboard.getObjective(scoreboard).getScore(entity); }
        catch { score = undefined; }
        if(score !== undefined) {
            const e = {
                entityId: entityId,
                scoreboard: scoreboard,
                score: getScore(entity, scoreboard)
            };
            scores.push(e);
        }
    });
});

world.afterEvents.entityLoad.subscribe(async (eventData) => {
    const entity = eventData.entity;
    if(entity.typeId === "minecraft:player" || !entity.hasTag("yes:keep_scoreboard")) return;
    const entityId = entity.id;
    for(var i=scores.length-1; i>=0; i--) {
        if(scores[i].entityId === entityId) {
            world.scoreboard.getObjective(scores[i].scoreboard).setScore(entity, scores[i].score);
            scores.splice(i);
        }
    }
});


//system.runInterval(() => {
//    console.warn(scores);
//});