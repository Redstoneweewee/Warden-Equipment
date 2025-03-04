import { system } from '@minecraft/server';
import { loopIds } from "../Main.js";
import { getEntities, getScore, removeCustomEntity } from "../basic_functions.js";
import { listOfEquipmentTypes } from '../equipment_attributes/list_of_equipment_types.js';

/**
 * Stops a timeout/loop from the `loopIds` array. A type may be passed to stop only specific types of timeout/loops. A tag may also be passed to be removed.
 * @param {Player} player - The player that the timeout/loop belongs to.
 * @param {String} [type] - The specific type of timeout/loop to be stopped. For example, `ability` or `cooldown`. If nothing is passed, all timeout/loops belong to the player will be removed.
 * @param {Array.<String>} [removeTags] - An **array of tags** to be removed. For example, [`ability:spear`, `cooldown:greatsword`]. Usually used in conjunction with getTagName() from basic_functions.js.
 */
function stopTimeout(player, type, removeTags, additionalFunctions) {
    if(type) {
        for(var i=loopIds.length-1; i>=0; i--) {
            if(loopIds[i].type === type && loopIds[i].entityId === player.id) {
                system.clearRun(loopIds[i].loopId);
                loopIds.splice(i, 1);
            }
        }
    }
    else {
        for(var i=loopIds.length-1; i>=0; i--) {
            if(loopIds[i].entityId === player.id) {
                system.clearRun(loopIds[i].loopId);
                loopIds.splice(i, 1);
            }
        }
    }
    if(player.isValid() && removeTags) {
        removeTags.forEach(tag => {
            player?.removeTag(tag);
        });
    }
    console.warn(`stopped loop for ${player.isValid() ? player.name : "unknown player"} with type ${type} and ${removeTags} removed.`); 
}

/**
 * Does any additional functions that the equipment requires.
 * @param {Player} player - The player that the equipment belongs to.
 * @param {object} additionalFunctions - The `additionalFunctions` object of `listOfEquipmentTypes`.
 */
function additionalFunctions(player, additionalFunctions) {
    const removeEntities = additionalFunctions.removeEntities ?? undefined;
    const removeFunction = additionalFunctions.removeFunction ?? undefined;
    if(removeEntities) {
        const identifier = getScore(player, "identifier");
        removeEntities.forEach(type => {
            getEntities(type, undefined, "owning_identifier", identifier, identifier).forEach(entity => {
                removeCustomEntity(entity);
            });
        });
    }
    if(removeFunction) {
        removeFunction(player);
    }
}

export { stopTimeout, additionalFunctions };


/* Legacy code
function stopAbility(player, itemStack) {
    for(var i=loopIds.length-1; i>=0; i--) {
        if(loopIds[i].type === "ability" && loopIds[i].entityId === player.id) {
            system.clearRun(loopIds[i].loopId);
            loopIds.splice(i, i+1);
            player?.removeTag(getTagName(itemStack, "ability:"));
        }
    }
    console.warn(`stopped player ${player.name} from using ${itemStack.typeId}`); 
}

function stopCooldown(player, itemStack) {
    for(var i=loopIds.length-1; i>=0; i--) {
        if(loopIds[i].type === "cooldown" && loopIds[i].entityId === player.id) {
            system.clearRun(loopIds[i].loopId);
            loopIds.splice(i, i+1);
            player?.removeTag(getTagName(itemStack, "cooldown:"));
        }
    }
    console.warn(`stopped cooldown for ${player.name}, using ${itemStack.typeId}`); 
}
*/