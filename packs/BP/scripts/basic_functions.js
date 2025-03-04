import { world, ItemStack, system } from '@minecraft/server';

/**
 * Functions the same as Math.clamp because Math.clamp doesn't exist for some reason.
 * @param {number} num - Number to be clamped.
 * @param {number} min - The lowest `num` can be.
 * @param {number} max - The highest `num` can be.
 * @returns {number} Returns the new number.
 */
function clamp(num, min, max) {
    if(num < min) { return min; }
    else if(num > max) { return max; }
    return num;
}


/**
 * Sets the `identifier` score of the entity to the first 9 digits of the entity's id. For example an entity with an id of `-4294967295` would get an identifier of `-294967295`.
 * @param {Entity} entity - The entity being provided the `identifier` score.
 */
function setIdentifier(entity) {
    if(entity.id >= 0) { world.scoreboard.getObjective("identifier").setScore(entity, parseInt(entity.id.substring(entity.id.length-9))); }
    else { world.scoreboard.getObjective("identifier").setScore(entity, parseInt(entity.id.substring(entity.id.length-9))*-1); }
}


/**
 * Sets the `owning_identifier` score of the receiver to the provider's `identifier` score. For example, a provider with an identifier of `-294967295` would be set to the receiver's `owning_identifier` score.
 * @example
 * Before: 
 * provider = { identifier: 100 }
 * receiver = { owning_identifier: none }
 * After: 
 * provider = { identifier: 100 } //nothing changes for the provider
 * receiver = { owning_identifier: 100 } //the receiver's `owning_identifier` score is the provider's `identifier` score
 * @param {Entity} receiver - The entity that receiving the `owning_identifier` score.
 * @param {Entity} provider - The entity that providing the `identifier` score.
 */
function setOwningIdentifier(receiver, provider) {
    let owningIdentifier = world.scoreboard.getObjective("identifier")?.getScore(provider) ?? undefined;
    if(owningIdentifier === undefined) { 
        setIdentifier(provider);
    }
    owningIdentifier = world.scoreboard.getObjective("identifier").getScore(provider);
    world.scoreboard.getObjective("owning_identifier").setScore(receiver, owningIdentifier);
}


/**
 * Sets the `<type>_hit_identifier` score of the receiver to the `identifier` or `owning_identifier` of the provider.
 * @param {Entity} receiver - The entity that receiving the `hit_identifier` score.
 * @param {Entity} provider - The entity that providing the score.
 * @param {Entity} type - The type of hit_identifier. Can only be `nexus` for now.
 */
function setHitIdentifier(receiver, provider, type) {
    let identifier = world.scoreboard.getObjective("identifier")?.getScore(provider) ?? undefined;
    if(identifier === undefined) { 
        identifier = world.scoreboard.getObjective("owning_identifier")?.getScore(provider) ?? undefined; 
        if(identifier === undefined) { console.warn(`[setHitIdentifier() Error]: The provider entity has no identifier or owning_identifier scores.`); return; }
    }
    world.scoreboard.getObjective(`${type}_hit_identifier`).setScore(receiver, identifier);
}


/**
 * Returns the scoreboard score of the entity.
 * @param {Entity} entity - The entity being passed.
 * @param {Scoreboard} scoreboard - The scoreboard to test for.
 * @returns {boolean} Returns the scoreboard score of the entity. If the entity has no score, returns `undefined`.
 */
function getScore(entity, scoreboard) {
    try { 
        let score = world.scoreboard.getObjective(scoreboard).getScore(entity); 
        if(score === undefined) { score = undefined; }
        return score;
    }
    catch { return undefined; }
}


//--- portions of this code was created by t17x and modified by Warden
/**
 * Returns whether a player is in creative. Works with entities as well, but throws a warning.
 * @param {Entity} player - The player being tested.
 * @returns {boolean} Returns whether a player is in creative.
 */
function isCreative(player) {
    try { return player.getGameMode() === "creative"; } 
    catch { /*console.warn(`[Function Error]: isCreative() was called on an entity that is not a player. Returned false.`);*/ return false; } 
}
//---


/**
 * Returns the name of an item in the format `<namespace>:<item_name>`. Mainly used to get rid of ability damage string endings; `yes:amethyst_spear_ad1` --> `yes:amethyst_spear`. 
 * @param {ItemStack} itemStack - The item being passed.
 * @returns {String} Returns the name of an item in the format `<namespace>:<item_name>`.
 */
function getItemName(itemStack) {
    return itemStack?.typeId.substring( 0, itemStack.typeId.indexOf("_ad") === itemStack.typeId.length-4 ? itemStack.typeId.length-4 : itemStack.typeId.length );
}


/**
 * Returns the type of an item. For example, `spear`, `sword`, or `echo_staff`. 
 * @param {ItemStack} itemStack - The item being passed.
 * @returns {String} Returns the type of an item. For example, `spear`, `sword`, or `echo_staff`. 
 */
function getItemType(itemStack) {
    if(itemStack === undefined) { return ""; }
    const arr1 = getItemName(itemStack).split("_");
    const arr2 = arr1[0].split(":");
    const arr = arr2.concat(arr1.splice(1));
    if(itemStack.hasTag("yes:two_worded_type")) { return `${arr[arr.length-2]}_${arr[arr.length-1]}`; }
    else { return arr[arr.length-1]; }
}


/**
 * Returns the type of an armor item. For example, `copper_armor` from `yes:copper_helmet` or `glowing_obsidian_armor` from `yes:glowing_obsidian_boots`. 
 * @param {ItemStack} itemStack - The item being passed.
 * @returns {String} Returns the type of an armor item. For example, `copper_armor` from `yes:copper_helmet` or `glowing_obsidian_armor` from `yes:glowing_obsidian_boots`.  
 */
function getArmorType(itemStack) {
    if(itemStack === undefined) { return ""; }
    const arr1 = itemStack.typeId.split("_");
    const arr2 = arr1[0].split(":");
    const arr = arr2.concat(arr1.splice(1));
    if(itemStack.hasTag("yes:two_worded_type")) { return `${arr[1]}_${arr[2]}_armor`; }
    if(itemStack.hasTag("yes:skip_first_word_type")) { return `${arr[2]}_armor`; }
    else { return `${arr[1]}_armor`; }
}


/**
 * Returns the tag name of an item in the format `<namespace>:<item_type>`. For example, `ability:spear`. If no namespace is passed, `ability:` is assumed.
 * @param {ItemStack} itemStack - The item being passed.
 * @param {String} [namespace] - The namespace of the tag name. For example, `ability:` or `cooldown:`
 * @returns {String} Returns the tag name of an item in the format `<namespace>:<item_type>`. For example, `ability:spear`.
 */
function getTagName(itemStack, namespace) {
    const type = itemStack.hasTag("minecraft:is_armor") ? getArmorType(itemStack) : getItemType(itemStack);
    if(namespace === undefined || namespace === "ability:") {
        return `ability:${type}`;
    }
    else {
        return `${namespace}${type}`;
    }
}


/**
 * Get entities in currently loaded dimensions using entity type, families, or scores. Dimensions are loaded if at least one player is there (at least for now).
 * @param {String} [type] - The entity type used to filter out entities.
 * @param {Array.<String>} [families] - The entity families used to filter out entities.
 * @param {String} [scoreboard] - The scoreboard to test for.
 * @param {number} [minScore] - The minimum score.
 * @param {number} [maxScore] - The maximum score.
 * @returns {Array.<Entity>} returns an array of entity objects.
 */
function getEntities(type, families, scoreboard, minScore, maxScore) {
    var entities = [];
    if(scoreboard === undefined) {
        let overworld = world.getDimension("overworld").getEntities({type: type, families: families});
        if(overworld.length != 0) { entities = overworld; }
        let nether = world.getDimension("nether").getEntities({type: type, families: families});
        if(nether.length != 0) { entities = entities.concat(nether); }
        let theEnd = world.getDimension("the_end").getEntities({type: type, families: families});
        if(theEnd.length != 0) { entities = entities.concat(theEnd); }
    }
    else {
        let overworld = world.getDimension("overworld").getEntities({type: type, families: families, scoreOptions: [{objective: scoreboard, minScore: minScore, maxScore: maxScore}]});
        if(overworld.length != 0) { entities = overworld; }
        let nether = world.getDimension("nether").getEntities({type: type, families: families, scoreOptions: [{objective: scoreboard, minScore: minScore, maxScore: maxScore}]});
        if(nether.length != 0) { entities = entities.concat(nether); }
        let theEnd = world.getDimension("the_end").getEntities({type: type, families: families, scoreOptions: [{objective: scoreboard, minScore: minScore, maxScore: maxScore}]});
        if(theEnd.length != 0) { entities = entities.concat(theEnd); }
    }
    return entities;
}


/**
 * Returns an array of objects, containing each equipment and slot the entity is currently wearing/holding. 
 * The returning array will always be in the format of the example below. 
 * >**Currently only works for players.**
 * @example
 * Returns:
 * [
 *  { slot: "Head",
 *    item: [ItemStack object] //such as obj.typeId = "minecraft:iron_helmet" 
 *  },
 *  { slot: "Chest",
 *    item: [ItemStack object] //such as obj.typeId = "minecraft:diamond_chestplate", 
 *  },
 *  { slot: "Legs",
 *    item: undefined 
 *  },
 *  { slot: "Feet",
 *    item: [ItemStack object] //such as obj.typeId = "yes:copper_boots" 
 *  },
 *  { slot: "Mainhand",
 *    item: [ItemStack object] //such as obj.typeId = "yes:amethyst_spear" 
 *  },
 *  { slot: "Offhand",
 *    item: [ItemStack object] //such as obj.typeId = "minecraft:shield" 
 *  }
 * ]
 * @param {Entity} entity - The entity being tested.
 * @returns {Array.<object>} Returns an array of objects, containing each equipment and slot the entity is currently wearing/holding. 
 */
function getAllEquipment(entity) {
    var equipment = [
        { slot: "Head", item: undefined },
        { slot: "Chest", item: undefined },
        { slot: "Legs", item: undefined },
        { slot: "Feet", item: undefined },
        { slot: "Mainhand", item: undefined },
        { slot: "Offhand", item: undefined }
    ];
    const slots = entity?.getComponent("minecraft:equippable")??undefined;
    if(slots === undefined) { return equipment }
    for(let i=0; i<equipment.length; i++) {
        equipment[i].item = slots?.getEquipment(equipment[i].slot)??undefined;
    }
    return equipment;
}


/**
 * Returns the power enchant multiplier for a bow weapon. For example, a bow with Power II will deal 75% more damage (1.75 multiplier).
 * @param {ItemStack} itemStack - The item being passed.
 * @returns {number} Returns the power enchant multiplier for a bow weapon.
 */
function getPowerEnchantMultiplier(itemStack) {
    let multiplier = 1;
    const powerLevel = itemStack.getComponent("minecraft:enchantable")?.getEnchantment("power")?.level ?? 0;
    if(powerLevel >= 1) { multiplier += 0.5 }
    multiplier += clamp(0.25*(powerLevel-1), 0, 999);
    return multiplier;
}


/**
 * Spawns an itemstack at a specific location.
 * @param {String} itemName - The typeId or name of the item being spawned.
 * @param {Vector3} location - The location that the item should spawn at.
 * @param {Player} player - The player who broke the block.
 * @param {number} amount - The amount of items.
 * @returns {Entity} Returns the item that was spawned.
 */
function spawnItem(itemName, location, player, amount) {
    const itemStack = new ItemStack(itemName, amount);
    console.warn(`itemStack: ${itemStack.typeId}`);
    system.run(() => {
        const itemEntity = player.dimension.spawnItem(itemStack, location); 
        return itemEntity;
    });
}


/**
 * Spawns an entity along with the `yes:keep_scoreboard` tag. 
 * The `yes:keep_scoreboard` tag allows entities to keep scoreboard scores throughout dimensions, 
 * but **must be removed before the entity is removed**.
 * @param {String} entityName - The typeId or name of the entity being spawned.
 * @param {Entity} spawner - The entity that is used to spawn the other entity.
 * @returns {Entity} Returns the entity that was spawned.
 */
function spawnCustomEntity(entityName, spawner) {
    const location = spawner.location;
    try {
        const entity = spawner.dimension.spawnEntity(entityName, location); 
        entity.addTag("yes:keep_scoreboard");
        return entity;
    }
    catch {
        console.warn(`could not spawn a custom entity at position (${location.x}, ${location.y}, ${location.z}).`)
        return;
    }
}


/**
 * Removes an entity along with the `yes:keep_scoreboard` tag. 
 * The `yes:keep_scoreboard` tag allows entities to keep scoreboard scores throughout dimensions, 
 * but must be removed before the entity is removed.
 * @param {Entity} entity - The entity being removed.
 */
function removeCustomEntity(entity) {
    if(entity !== undefined && entity.isValid()) {
        entity.removeTag("yes:keep_scoreboard");
        entity.remove();
    }
}


/**
 * Returns the elements that are in present in both arrays. 
 * @param {Array} array1 - The first array to compare.
 * @param {Array} array2 - The second array to compare.
 * @returns {Array} Returns an array containing the elements that are present in both arrays.
 */
function getArrayIntersection(arr1, arr2) {
    return arr1.filter(element => arr2.includes(element));
}


/**
 * Combines two arrays of entities and removes any duplicate entities, returning an array of unique entities.
 * @param {Entity} array1 - The first array of entities.
 * @param {Entity} array2 - The second array of entities.
 * @returns {Array.<Entity>} Returns an array of unique entities.
 */
function removeDuplicateEntities(array1, array2) {
    const combinedArray = array1.concat(array2);

    return combinedArray.filter((item, index, array) =>
        index === array.findIndex((element) => element.id === item.id)
    );
}


/**
 * Tests whether the entity is an attackable entity. For example, items and projectiles are not attackable, but cows and zombies are. Players are included if pvp is on and not included if pvp is off.
 * @param {Entity} entity - The entity being tested.
 * @param {Entity} [attacker] - The entity attacking. Makes sure the attacker doesn't hit itself.
 * @returns {boolean} Returns whether the entity is attackable or not.
 */
function isAttackableEntity(entity, attacker) {
    if(!entity.isValid()) return false;
    const excludedFams  = ["inanimate", "projectile"];
    const excludedTypes = ["item", "snowball", "arrow", "tnt", "egg", "ender_pearl", "fireworks_rocket", "fireball", "dragon_fireball", "small_fireball", "evocation_fang", "eye_of_ender_signal", "falling_block", "fishing_hook"];
	for (const e of excludedTypes) {
		if(entity.typeId === `minecraft:${e}`) return false;
	}
    for (const e of excludedFams) {
		if(entity?.getComponent("minecraft:type_family")?.hasTypeFamily(e) ?? 0) { return false; }
	}
	if(isCreative(entity)) return false;
    if(world.gameRules.pvp === false && entity.typeId === "minecraft:player") { return false; }
    if(attacker && (entity.id === attacker.id)) return false;
	return true;
}


/**
 * Tests whether the entity is hostile or on the hostile side of neutral. Players are included if pvp is on and not included if pvp is off.
 * @param {Entity} entity - The entity being tested.
 * @param {Entity} [self] - The entity itself. Makes sure the entity is not hostile to itself.
 * @returns {boolean} Returns whether the entity is hostile or not.
 */
function isHostileEntity(entity, self) {
    if(!entity.isValid()) return false;
    if(self && (entity.id === self.id)) return false;
    const includedFams  = ["monster", "dragon", "hoglin"];
    for (const e of includedFams) {
		if(entity?.getComponent("minecraft:type_family")?.hasTypeFamily(e) ?? 0) { return true; }
	}
    if(world.gameRules.pvp === true && entity.typeId === "minecraft:player") { return true; }
	return false;
}


/**
 * Tests whether the entity is an ally, such as players, tamed wolves, allays, and custom allied mobs. Players are included if pvp is off and not included if pvp is on.
 * @param {Entity} entity - The entity being tested.
 * @param {Entity} [self] - The entity itself. Excludes itself because the entity is not its own ally.
 * @returns {boolean} Returns whether the entity is hostile or not.
 */
function isAlliedEntity(entity, self) {
    if(!entity.isValid()) return false;
    if(self && (entity.id === self.id)) return false;
    const includedFams  = ["ally", "allay", "wolf", "copper_golem"];
    for (const e of includedFams) {
        if(e === "wolf" && (entity?.getComponent("minecraft:type_family")?.hasTypeFamily(e) ?? 0) && (entity?.getComponent("minecraft:is_tamed") ?? 0)) {
            return true;
        }
		else if(entity?.getComponent("minecraft:type_family")?.hasTypeFamily(e) ?? 0) { return true; }
	}
    if(world.gameRules.pvp === false && entity.typeId === "minecraft:player") { return true; }
	return false;
}


/**
 * Tests whether the entity has any of the items passed in their inventory. 
 * @param {Entity} entity - The entity being tested.
 * @param {Array.<String>} itemNames - The array of items to test for.
 * @returns {boolean} Returns whether the entity has any of the items passed in their inventory. 
 */
function hasItemTest(entity, itemNames) {
    const container = entity?.getComponent('minecraft:inventory')?.container ?? undefined;
    if(container === undefined) { return false; }
    for(let i=0; i<container.size; i++) {
        for(let j in itemNames) {
            const itemName = itemNames[j];
            if((container.getItem(i)?.typeId ?? "") === itemName) {
                return true;
            }
        }
    }
    const slots = entity?.getComponent("minecraft:equippable") ?? undefined;
    if(slots !== undefined) {
        for(let i in itemNames) {
            const itemName = itemNames[i];
            if((slots.getEquipment("Head")?.typeId ?? "") === itemName) { return true; }
            else if((slots.getEquipment("Chest")?.typeId ?? "") === itemName) { return true; }
            else if((slots.getEquipment("Legs")?.typeId ?? "") === itemName) { return true; }
            else if((slots.getEquipment("Feet")?.typeId ?? "") === itemName) { return true; }
            else if((slots.getEquipment("Offhand")?.typeId ?? "") === itemName) { return true; }
        }
    }
    return false;
}


/**
 * Offsets a location based on the offset type. 
 * @param {Vector3} [location] - The original location. Only used when type = `~`.
 * @param {Entity} [entity] - The entity that the new location will be offset from. Only used when type = `^`.
 * @throws {Error} If neither `location` nor `entity` is provided.
 * @param {number} xAdd - The x offset in blocks.
 * @param {number} yAdd - The y offset in blocks.
 * @param {number} zAdd - The z offset in blocks.
 * @param {String} type - The type of offset. Can either be `~` or `^`. `~` is relative to the world while `^` is relative to an entity's view direction.
 * @returns {Vector3} Returns the new location.
 */
function changeLocation(location, entity, xAdd, yAdd, zAdd, type) {
    if (!location && !entity) { throw new Error("At least one initial parameter must be provided for changeLocation(), either a location or an entity."); }
    if(type === "^") {
        const location = entity.location;
        const xRotation = -(entity.getRotation().y)/180*Math.PI; //yes, the y rotation is actually x rotation ._.
        var newLocation = {
            x: location.x + Math.sin(xRotation) * zAdd,
            y: location.y + yAdd,
            z: location.z + Math.cos(xRotation) * zAdd
        };
        const newViewDirection = {
            x: Math.sin(xRotation+Math.PI/2),
            z: Math.cos(xRotation+Math.PI/2)
        };
        newLocation = {
            x: newLocation.x + newViewDirection.x * xAdd,
            y: newLocation.y,
            z: newLocation.z + newViewDirection.z * xAdd
        };
    
        return newLocation;
    }
    else {
        const newLocation = { x:location.x+xAdd, y:location.y+yAdd, z:location.z+zAdd };
        return newLocation;
    }
}


/**
 * Offsets a location forwards or backwards from an entity's relative view direction.
 * @param {Entity} entity - The entity that the new location will be offset from. Only used when type = `^`.
 * @param {number} offset - The offset in blocks.
 * @returns {Vector3} Returns the new location.
 */
function changeLocationFromViewDirection(entity, offset) {
    const location = entity.getHeadLocation();
    const viewDirection = entity.getViewDirection();
    var newLocation = {
        x: location.x + viewDirection.x*offset,
        y: location.y + viewDirection.y*offset,
        z: location.z + viewDirection.z*offset
    };

    return newLocation;
}


/**
 * Returns the distance between two locations.
 * @param {Vector3} location1 - The first location.
 * @param {Vector3} location2 - The second location.
 * @returns {Vector3} Returns the distance between two locations.
 */
function distanceBetweenLocations(location1, location2) {
    return Math.sqrt((location2.x-location1.x)**2 + (location2.y-location1.y)**2 + (location2.z-location1.z)**2);
}


//--- portions of this code was created by t17x and modified by Warden
/**
 * Applies durability damage to an entity's equipment. 
 * Takes into account the unbreaking enchant. 
 * Can be applied to every equipment slot. 
 * Will not deal durability damage to players in creative.
 * @param {Entity} entity - The entity that this item belongs to.
 * @param {ItemStack} itemStack - The item that should be damaged.
 * @param {String} slot - The slot that the item is in. Can be `Head`, `Chest`, `Legs`, `Feet`, `Mainhand`, or `Offhand` (must be capitalized).
 * @param {number} damage - The amount of durability damage that should be applied.
 */
function applyDurabilityDamage(entity, itemStack, slot, damage) {
    if (isCreative(entity)) { return; }
    const unbreakingLevel = itemStack.getComponent("minecraft:enchantable")?.getEnchantment("unbreaking")?.level ?? 0;
    const r = Math.floor(Math.random() * 10);
    if (!unbreakingLevel) durDmgCont(entity, itemStack, slot, damage);
    else if (unbreakingLevel === 1 && r > 2) durDmgCont(entity, itemStack, slot, damage);
    else if (unbreakingLevel === 2 && r > 4) durDmgCont(entity, itemStack, slot, damage);
    else if (unbreakingLevel === 3 && r > 5) durDmgCont(entity, itemStack, slot, damage);
}
function durDmgCont(entity, itemStack, slot, damage) {
    let actualDurability = itemStack.getComponent("minecraft:durability").maxDurability - itemStack.getComponent("minecraft:durability").damage;
    let damageTotalRemove = damage;
    if (actualDurability > damageTotalRemove) {
        itemStack.getComponent("durability").damage = itemStack.getComponent("durability").damage + damageTotalRemove;
        entity.getComponent("minecraft:equippable").setEquipment(slot, itemStack);
    }
    else {
        entity.getComponent("minecraft:equippable").setEquipment(slot, undefined);
        entity.playSound('random.break', entity.location);
    }
    console.warn(`applied ${damage} damage to ${itemStack.typeId} item.`);
}
//---


/**
 * Applies damage to a target based on the base damage, ability damage enchant, cause of damage, and source of attack.
 * @param {Entity} target - The entity receiving damage.
 * @param {ItemStack} itemStack - The weapon that is being used to deal damage.
 * @param {number} damage - The amount of damage being dealt.
 * @param {String} cause - The cause of the damage. For example, `entityAttack` or `void`.
 * @param {Entity} [attacker] - The entity who is attacking the target.
 */
function applyAbilityDamage(target, damage, cause, attacker) {
    if(attacker) { target.applyDamage(damage, { cause: cause, damagingEntity: attacker } ); }
    else { target.applyDamage(damage, { cause: cause } ); }
    console.warn(`applied damage: ${damage}`);
}


/**
 * Applies true knockback to an entity based on the location of the attacker.
 * @param {Entity} target - The entity receiving knockback.
 * @param {number} horizontalKnockback - The amount of knockback being applied horizontally.
 * @param {number} verticalKnockback - The amount of knockback being applied vertically.
 * @param {Entity} attacker - The entity dealing knockback.
 * @param {boolean} trueKnockback - Whether the knockback can be resisted by knockback resistance. `true` = will not be resisted by knockback resistance.
 */
function applyCustomKnockback(target, horizontalKnockback, verticalKnockback, attacker, trueKnockback) {
    let viewDirection = attacker.getViewDirection();
    const rotation = attacker.getRotation();
    if (rotation.x > 30) {
        viewDirection.x *= 2.1;
        viewDirection.y *= 2.1;
        viewDirection.z *= 2.1;
    }
    if(target.typeId !== "minecraft:player") {
        target.clearVelocity();
        if(trueKnockback) { target.applyImpulse({x:viewDirection.x*horizontalKnockback/1.5, y:(viewDirection.y+verticalKnockback/2), z:viewDirection.z*horizontalKnockback/1.5}) }
        else { target.applyKnockback(viewDirection.x, viewDirection.z, horizontalKnockback, verticalKnockback/2.8); }
    }
    else {
        target.applyKnockback(viewDirection.x, viewDirection.z, horizontalKnockback, verticalKnockback/2.8);
    }
    //target.applyKnockback(viewDirection.x, viewDirection.z, knockback, knockback/5);
}


/**
 * Plays a sound for players in range using dynamic and directional sound.
 * @param {object} entity - The entity that this sound originates from.
 * @param {String} sound - The sound that should be played.
 * @param {number} range - The range of the sound in blocks.
 * @param {number} [minPitch] - The minimum random pitch of the sound.
 * @param {number} [maxPitch] - The maximum random pitch of the sound.
 */
function playSoundDynamic(entity, sound, range, minPitch, maxPitch) {
    const dimension = entity.dimension;
    const location = entity.location;
    var nearbyPlayers = dimension.getEntities({type: "minecraft:player", location: location, maxDistance: range});
    nearbyPlayers.forEach(e => {
        var loc1 = location;
        var loc2 = e.location;

        var angleX = Math.atan(((loc1.x-loc2.x)/(loc1.z-loc2.z))?((loc1.x-loc2.x)/(loc1.z-loc2.z)):0);
        if(loc1.z-loc2.z < 0) { angleX = (Math.PI/2)+(Math.PI/2+angleX); }
        var horizontalDistance = Math.sqrt(Math.pow(loc1.x-loc2.x,2)+Math.pow(loc1.z-loc2.z,2));
        var angleY = Math.atan(((loc1.y-loc2.y)/horizontalDistance)?((loc1.y-loc2.y)/horizontalDistance):0);
        var distance = Math.sqrt(Math.pow(loc1.x-loc2.x,2)+Math.pow(loc1.y-loc2.y,2)+Math.pow(loc1.z-loc2.z,2));
        var volume = 1-(distance/range);
        if(distance > 15) { distance = 15; }
        var newHDistance = distance*Math.cos(angleY);
        var newLoc = { x:0, y:0, z:0 };
        newLoc.y = loc2.y + distance*Math.sin(angleY);
        newLoc.z = loc2.z + newHDistance*Math.cos(angleX);
        newLoc.x = loc2.x + newHDistance*Math.sin(angleX);
        minPitch = minPitch ?? 1; 
        maxPitch = maxPitch ?? 1; 
        const pitch = Math.round(randomNum(minPitch, maxPitch)*100)/100;
        e.playSound(sound, {location: newLoc, volume: volume, pitch: pitch} );
        //console.warn(`${e.name} ${sound} ${distance} ${volume}`);
    });
}


/**
 * Randomly teleports an entity around a location based on the range. Does not randomize the y-axis.
 * @param {object} entity - The entity being teleported.
 * @param {String} location - The center location.
 * @param {number} range - The max distance away from the center location (radius).
 */
function randomTeleport(entity, location, range) {
    const dimension = entity.dimension;
    const newLocation = { 
        x: location.x + Math.round((Math.random()*range*2 - range)*100)/100,
        y: location.y,
        z: location.z + Math.round((Math.random()*range*2 - range)*100)/100
    };
    entity.teleport(newLocation, {dimension: dimension});
}


/**
 * Returns a random float from max to min, not inclusive.
 * @param {number} max - The max number.
 * @param {number} min - The min number.
 * @returns {number} Returns a random float from max to min, not inclusive.
 */
function randomNum(min, max) {
	return Math.random() * (max - min) + min;
}


export { 
    clamp,
    setIdentifier,
    setOwningIdentifier,
    setHitIdentifier,
    getScore,
    isCreative, 
    getItemName, 
    getItemType,
    getArmorType,
    getTagName,
    getEntities,
    getAllEquipment,
    getPowerEnchantMultiplier,
    spawnItem,
    spawnCustomEntity,
    removeCustomEntity,
    getArrayIntersection,
    removeDuplicateEntities,
    isAttackableEntity,
    isHostileEntity,
    isAlliedEntity,
    hasItemTest,
    changeLocation,
    changeLocationFromViewDirection,
    distanceBetweenLocations,
    applyDurabilityDamage,
    applyAbilityDamage,
    applyCustomKnockback,
    playSoundDynamic,
    randomTeleport,
    randomNum
};