import { world, system } from '@minecraft/server';
import { getItemType, getTagName, getScore, removeCustomEntity } from "../basic_functions.js";
import { stopTimeout } from './stop_timeout.js';
import { loopIds } from "../Main.js";


/**
 * Initiates an item cooldown for a player.
 * @param {Player} player - The player receiving an item cooldown.
 * @param {Itemstack} itemStack - The item that is receiving cooldown.
 * @param {number} cooldown - The length of the cooldown in ticks.
 * @param {String} cooldownType - The type of cooldown. Can be `ability` or `hit`.
 * @param {boolean} cousesItemCooldownoldown - If true, also causes item cooldown (the white bar on the item in your inventory).
 * @param {boolean} hasEmptyHitEntity - If true, removes the empty hit entity.
 */
function startCooldown(player, itemStack, cooldown, cooldownType, usesItemCooldown, hasEmptyHitEntity) {
    const itemType = getItemType(itemStack);
    player.addTag(getTagName(itemStack, `${cooldownType}Cooldown:`));
    if(usesItemCooldown) { player.startItemCooldown(itemType, cooldown); }
    if(cooldownType === "ability") {
        world.scoreboard.getObjective("ability_cooldown").setScore(player, cooldown);
        const cooldownId = system.runInterval(() => {
            world.scoreboard.getObjective("ability_cooldown").addScore(player, -1);
            if(world.scoreboard.getObjective("ability_cooldown").getScore(player) <= 0) {
                stopTimeout(player, `${cooldownType}Cooldown`, [getTagName(itemStack, `${cooldownType}Cooldown:`)]);
                if(hasEmptyHitEntity) {
                    const identifier = getScore(player, "identifier");
                    const entity = player.dimension.getEntities({type: "yes:empty_hit_entity", scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]});
                    entity.forEach(e => {
                        removeCustomEntity(e);
                    });
                }
            }
        });
        loopIds.push({entityId: player.id, loopId: cooldownId, type: `${cooldownType}Cooldown`});
    }
    else {
        const cooldownId = system.runTimeout(() => {
            stopTimeout(player, `${cooldownType}Cooldown`, [getTagName(itemStack, `${cooldownType}Cooldown:`)]);
            if(hasEmptyHitEntity) {
                const identifier = getScore(player, "identifier");
                const entity = player.dimension.getEntities({type: "yes:empty_hit_entity", scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]});
                entity.forEach(e => {
                    removeCustomEntity(e);
                });
            }
        }, cooldown);
        loopIds.push({entityId: player.id, loopId: cooldownId, type: `${cooldownType}Cooldown`});
    }
}

export { startCooldown };