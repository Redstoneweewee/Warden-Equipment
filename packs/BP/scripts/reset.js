import { world, system } from "@minecraft/server";
import { listOfEquipmentTypes } from "./equipment_attributes/list_of_equipment_types";
import { removeCustomEntity, getScore } from "./basic_functions";
import { stopTimeout } from "./equipment_abilities/stop_timeout";
import { setNormalLevel } from "./resource_pack_link/xp_level";

/**
 * Resets necessary tags, scoreboards, and script elements for a player.
 * @param {Entity} entity - The player being reset.
 * @param {String} type - the type of reset. Can be `reload` or `death`.
 */
function resetPlayer(player, type) {
    if(world.scoreboard.getObjective("exp").getScore(player) > 0) {
        setNormalLevel(player);
    }

    listOfEquipmentTypes.weapons.forEach(obj => {
        if(player.hasTag(`ability:${obj.type}`)) {
            stopTimeout(player, "ability", [`ability:${obj.type}`]);
        }
    });
    listOfEquipmentTypes.weapons.forEach(obj => {
        if(player.hasTag(`abilityCooldown:${obj.type}`)) {
            stopTimeout(player, "abilityCooldown", [`abilityCooldown:${obj.type}`]);
        }
    });
    listOfEquipmentTypes.weapons.forEach(obj => {
        if(player.hasTag(`hitCooldown:${obj.type}`)) {
            stopTimeout(player, "hitCooldown", [`hitCooldown:${obj.type}`]);
        }
    });
    listOfEquipmentTypes.armor.forEach(obj => {
        if(player.hasTag(`armorAbility:${obj.type}`)) {
            stopTimeout(player, "armorAbility", [`armorAbility:${obj.type}`]);
        }
    });
    stopTimeout(player, "animation", [`animation:weapon`]);

    world.scoreboard.getObjective("whip_animation").setScore(player, 0);

    if(type === "reload") {
        let entities = player.dimension.getEntities({families: ["despawn_on_reload"]});
        entities.forEach(e => {
            removeCustomEntity(e);
        });
    }
    if(type === "death") {
        const identifier = getScore(player, "identifier");
        const entity = player.dimension.getEntities({type: "yes:empty_hit_entity", scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]});
        entity.forEach(e => {
            removeCustomEntity(e);
        });
    }
}

export { resetPlayer };

world.beforeEvents.playerLeave.subscribe(async (eventData) => {
    const player = eventData.player;
    const dimension = player.dimension;
    const identifier = getScore(player, "identifier");
    system.run(() => {
        stopTimeout(player);
        const owningEntities = dimension.getEntities({scoreOptions: [{objective: "owning_identifier", minScore: identifier, maxScore: identifier}]});
        owningEntities.forEach(entity => {
            removeCustomEntity(entity);
        });
    });
});