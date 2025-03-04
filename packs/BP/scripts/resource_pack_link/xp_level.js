import { world } from "@minecraft/server";

export function setNormalLevel(entity) {
    let normalXp = world.scoreboard.getObjective("xp_n").getScore(entity);
    entity.resetLevel();
    while(normalXp >= Math.pow(2,24)) {
        entity.addExperience(Math.pow(2,24));
        normalXp -= Math.pow(2,24);
    }
    entity.addExperience(normalXp);
}