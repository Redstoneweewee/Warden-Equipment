//weapon abilities functions
import { world, system, ItemStack, EffectTypes } from '@minecraft/server';
import { clamp, getItemName, getItemType, getTagName, getAllEquipment, getArrayIntersection, removeDuplicateEntities, isAttackableEntity, isHostileEntity, isAlliedEntity, changeLocation, changeLocationFromViewDirection, distanceBetweenLocations, applyDurabilityDamage, applyAbilityDamage, applyCustomKnockback, playSoundDynamic, spawnCustomEntity, setOwningIdentifier, randomTeleport, getEntities, getScore, removeCustomEntity, hasItemTest, isCreative } from "../basic_functions.js";
import { armorAttributes, getArmorIndex } from '../equipment_attributes/armor.js';
import { nexusProjectileTargeting } from './nexus.js';
import { startCooldown } from './weapon_cooldown.js';
import { stopTimeout } from "./stop_timeout.js";
import { loopIds } from "../Main.js";
import { runTime } from '../tick.js';

const maxEffectDuration = 20000000;

/** playerLocations is an array players' old locations, used to remove blocks that are set at the player's location.
 * @example
 * [
 *   {
 *     location: { x: 0, y: 1, z: 2 },
 *     playerId: 1234567890
 *   },
 *   etc.
 * ]
 */
var playerLocations = [];

function copperArmorAbility(player) {
    const index = getArmorIndex("copper_armor");
    player.addTag("equipmentAbility:copper_armor");
    const id = system.runInterval(() => {
        if(!player.isValid() || !player.hasTag("equipmentAbility:copper_armor")) { return; }
        if(armorAttributes[index].ability1.active) {
            world.scoreboard.getObjective("copper_oxidization").addScore(player, 1);
            if(getScore(player, "copper_oxidization") >= armorAttributes[index].ability1.minScore) {
                const random = getScore(player, "copper_oxidization") >= armorAttributes[index].ability1.maxScore ? 0 : Math.random();
                if(random <= armorAttributes[index].ability1.chance) {
                    let allEquipment = getAllEquipment(player);
                    let equipment = [];
                    allEquipment.forEach(obj => {
                        if(obj.item !== undefined && obj.item.typeId.includes("copper") && obj.item.typeId.includes("yes:") && !obj.item.typeId.includes("oxidized") && !obj.item.typeId.includes("waxed")) {
                            equipment.push(
                                {
                                    slot: obj.slot,
                                    item: obj.item
                                }
                            );
                        }
                    });
                    const randomSlot = Math.floor(Math.random() * equipment.length);
                    let newItemTypeId = "";
                    if(equipment[randomSlot].item.typeId.includes("exposed")) {
                        newItemTypeId = `yes:weathered_copper_${getItemType(equipment[randomSlot].item)}`;
                    }
                    else if(equipment[randomSlot].item.typeId.includes("weathered")) {
                        newItemTypeId = `yes:oxidized_copper_${getItemType(equipment[randomSlot].item)}`;
                    }
                    else {
                        newItemTypeId = `yes:exposed_copper_${getItemType(equipment[randomSlot].item)}`;
                    }
                    const enchantments = equipment[randomSlot].item.getComponent("minecraft:enchantable")?.getEnchantments() ?? undefined;
                    const newItem = new ItemStack(newItemTypeId, 1);
                    if(enchantments !== undefined) { newItem.getComponent("minecraft:enchantable").addEnchantments(enchantments); } 
                    player.getComponent("minecraft:equippable").setEquipment(equipment[randomSlot].slot, newItem);
                    world.scoreboard.getObjective("copper_oxidization").setScore(player, 0);
                }
            }
        }
    }, armorAttributes[index].ability1.ticksPerCheck);
    loopIds.push({entityId: player.id, loopId: id, type: "equipmentAbility"});
}
function phantomArmorAbility(player) {
    const index = getArmorIndex("phantom_armor");
    player.addTag("armorAbility:phantom_armor");
    const id = system.runInterval(() => {
        if(!player.isValid() || !player.hasTag("armorAbility:phantom_armor")) { return; }
        if(armorAttributes[index].ability2.active && player.isSneaking && !player.isOnGround) { player.addEffect(EffectTypes.get(armorAttributes[index].ability2.effect), armorAttributes[index].ability2.duration, { amplifier: armorAttributes[index].ability2.level-1, showParticles: armorAttributes[index].ability2.showParticles }); }
        if(armorAttributes[index].ability1.active) {
            const score = getScore(player, "phantom_invisibility");
            if(player.isSprinting || player.isJumping && score > 0) { 
                world.scoreboard.getObjective("phantom_invisibility").addScore(player, -armorAttributes[index].ability1.lossPerTick); 
                if(getScore(player, "phantom_invisibility") < 0) {
                    world.scoreboard.getObjective("phantom_invisibility").setScore(player, 0); 
                }
            }
            else if(!player.isSprinting && !player.isJumping && score < armorAttributes[index].ability1.threshold.max) { 
                world.scoreboard.getObjective("phantom_invisibility").addScore(player, armorAttributes[index].ability1.gainPerTick); 
            }
            const effect = armorAttributes[index].ability1.effect;
            const invisMin = armorAttributes[index].ability1.threshold.min;
            const invisMid = armorAttributes[index].ability1.threshold.mid;
            if(score >= invisMin-1 && score <= invisMin+1) {
                player.runCommandAsync(`particle ${armorAttributes[index].ability1.particle1} ~~1~`);
                player.runCommandAsync(`particle ${armorAttributes[index].ability1.particle2} ~~1~`);
            }
            if     (score >= invisMid)                     { player.addEffect(EffectTypes.get(effect), 202, { amplifier: armorAttributes[index].ability1.level-1, showParticles: armorAttributes[index].ability1.showParticles }); }
            else if(score == invisMin)                     { player.addEffect(EffectTypes.get(effect), 180, { amplifier: armorAttributes[index].ability1.level-1, showParticles: armorAttributes[index].ability1.showParticles }); }
            else if(score > invisMin && runTime % 20 == 0) { player.addEffect(EffectTypes.get(effect), 180, { amplifier: armorAttributes[index].ability1.level-1, showParticles: armorAttributes[index].ability1.showParticles }); }
            else if(score < invisMin)                      { player.removeEffect(EffectTypes.get(effect)); }
        }
    });
    loopIds.push({entityId: player.id, loopId: id, type: "armorAbility"});
}
function glowingObsidianArmorAbility(player) {
    const index = getArmorIndex("glowing_obsidian_armor");
    player.addTag("armorAbility:glowing_obsidian_armor");
    const id1 = system.runInterval(() => {
        if(!player.isValid() || !player.hasTag("armorAbility:glowing_obsidian_armor")) { return; }
        if(armorAttributes[index].ability1.active) {    
            const location = player.location;
            const enemies = player.dimension.getEntities( { location: location, maxDistance: armorAttributes[index].ability1.enemiesRange } );
            let amountOfEnemies = 0;
            enemies.forEach(enemy => {
                if(!isHostileEntity(enemy, player)) { return; }
                amountOfEnemies++;
            });
            if(amountOfEnemies > 5) { amountOfEnemies = 5; }
            if(amountOfEnemies >= 1) {
                playSoundDynamic(player, armorAttributes[index].ability1.sound, armorAttributes[index].ability1.soundRange, armorAttributes[index].ability1.minPitch, armorAttributes[index].ability1.maxPitch);
                player.runCommandAsync(`particle ${armorAttributes[index].ability1.particle} ~~1~`);
                if(amountOfEnemies === 5) {
                    system.runTimeout(() => {
                        playSoundDynamic(player, armorAttributes[index].ability1.sound, armorAttributes[index].ability1.soundRange, armorAttributes[index].ability1.minPitch, armorAttributes[index].ability1.maxPitch);
                        player.runCommandAsync(`particle ${armorAttributes[index].ability1.particle} ~~1~`);
                    }, Math.round(armorAttributes[index].ability1.ticksPerCheck/3));
                    system.runTimeout(() => {
                        playSoundDynamic(player, armorAttributes[index].ability1.sound, armorAttributes[index].ability1.soundRange, armorAttributes[index].ability1.minPitch, armorAttributes[index].ability1.maxPitch);
                        player.runCommandAsync(`particle ${armorAttributes[index].ability1.particle} ~~1~`);
                    }, Math.round(armorAttributes[index].ability1.ticksPerCheck/3*2));
                }
                else if(amountOfEnemies >= 3) {
                    system.runTimeout(() => {
                        playSoundDynamic(player, armorAttributes[index].ability1.sound, armorAttributes[index].ability1.soundRange, armorAttributes[index].ability1.minPitch, armorAttributes[index].ability1.maxPitch);
                        player.runCommandAsync(`particle ${armorAttributes[index].ability1.particle} ~~1~`);
                    }, Math.round(armorAttributes[index].ability1.ticksPerCheck/2));
                }
                const effect = armorAttributes[index].ability1.effect;
                const duration = ((amountOfEnemies-1)/(armorAttributes[index].ability1.threshold.max-1))*armorAttributes[index].ability1.ticksPerCheck/2 + armorAttributes[index].ability1.ticksPerCheck/2;
                const allies = player.dimension.getEntities( { location: location, maxDistance: armorAttributes[index].ability1.alliesRange } );
                allies.forEach(ally => {
                    if(!isAlliedEntity(ally, player)) { return; }
                    ally.addEffect(EffectTypes.get(effect), duration, { amplifier: armorAttributes[index].ability1.level-1, showParticles: armorAttributes[index].ability1.showParticles });
                });
                player.addEffect(EffectTypes.get(effect), duration, { amplifier: armorAttributes[index].ability1.level-1, showParticles: armorAttributes[index].ability1.showParticles });
            }
        }
    }, armorAttributes[index].ability1.ticksPerCheck);
    loopIds.push({entityId: player.id, loopId: id1, type: "armorAbility"});
    let oldLocation;
    if(armorAttributes[index].ability2.active) {    
        oldLocation = {
            x: Math.floor(player.location.x),
            y: Math.floor(player.location.y),
            z: Math.floor(player.location.z)
        };
        for(let i=playerLocations.length-1; i>=0; i--) {
            if(playerLocations[i].playerId === player.id) { playerLocations.splice(i, 1); }
        }
        playerLocations.push(
            {
                location: oldLocation,
                playerId: player.id
            }
        );
        const block1 = player.dimension.getBlock(oldLocation);
        const block2 = player.dimension.getBlock({x: oldLocation.x, y: oldLocation.y+2, z: oldLocation.z})
        if(block1.matches("minecraft:water") || block1.matches("minecraft:flowing_water")) { player.runCommandAsync(`setblock ${oldLocation.x} ${oldLocation.y} ${oldLocation.z} ${armorAttributes[index].ability2.placeBlock} ["block_light_level"=${armorAttributes[index].ability2.lightLevel}]`); }
        else { player.runCommandAsync(`setblock ${oldLocation.x} ${oldLocation.y} ${oldLocation.z} ${armorAttributes[index].ability2.placeBlock} ["block_light_level"=${armorAttributes[index].ability2.lightLevel}] keep`); }
        if(block2.matches("minecraft:water") || block2.matches("minecraft:flowing_water")) { player.runCommandAsync(`setblock ${oldLocation.x} ${oldLocation.y+2} ${oldLocation.z} ${armorAttributes[index].ability2.placeBlock} ["block_light_level"=${armorAttributes[index].ability2.lightLevel}]`); }
        else { player.runCommandAsync(`setblock ${oldLocation.x} ${oldLocation.y+2} ${oldLocation.z} ${armorAttributes[index].ability2.placeBlock} ["block_light_level"=${armorAttributes[index].ability2.lightLevel}] keep`); }
    }
    const id2 = system.runInterval(() => {
        if(!player.isValid() || !player.hasTag("armorAbility:glowing_obsidian_armor")) { return; }
        if(armorAttributes[index].ability2.active) {    
            const newLocation = {
                x: Math.floor(player.location.x),
                y: Math.floor(player.location.y),
                z: Math.floor(player.location.z)
            }
            if(oldLocation.x !== newLocation.x || oldLocation.y !== newLocation.y || oldLocation.z !== newLocation.z) {
                player.runCommandAsync(`fill ${oldLocation.x} ${oldLocation.y} ${oldLocation.z} ${oldLocation.x} ${oldLocation.y} ${oldLocation.z} air replace ${armorAttributes[index].ability2.placeBlock}`);
                player.runCommandAsync(`fill ${oldLocation.x} ${oldLocation.y+2} ${oldLocation.z} ${oldLocation.x} ${oldLocation.y+2} ${oldLocation.z} air replace ${armorAttributes[index].ability2.placeBlock}`);
                const block1 = player.dimension.getBlock(newLocation);
                const block2 = player.dimension.getBlock({x: newLocation.x, y: newLocation.y+2, z: newLocation.z})
                if(block1.matches("minecraft:water") || block1.matches("minecraft:flowing_water")) { player.runCommandAsync(`setblock ${newLocation.x} ${newLocation.y} ${newLocation.z} ${armorAttributes[index].ability2.placeBlock} ["block_light_level"=${armorAttributes[index].ability2.lightLevel}]`); }
                else { player.runCommandAsync(`setblock ${newLocation.x} ${newLocation.y} ${newLocation.z} ${armorAttributes[index].ability2.placeBlock} ["block_light_level"=${armorAttributes[index].ability2.lightLevel}] keep`); }
                if(block2.matches("minecraft:water") || block2.matches("minecraft:flowing_water")) { player.runCommandAsync(`setblock ${newLocation.x} ${newLocation.y+2} ${newLocation.z} ${armorAttributes[index].ability2.placeBlock} ["block_light_level"=${armorAttributes[index].ability2.lightLevel}]`); }
                else { player.runCommandAsync(`setblock ${newLocation.x} ${newLocation.y+2} ${newLocation.z} ${armorAttributes[index].ability2.placeBlock} ["block_light_level"=${armorAttributes[index].ability2.lightLevel}] keep`); }
            }
            oldLocation = {
                x: Math.floor(newLocation.x),
                y: Math.floor(newLocation.y),
                z: Math.floor(newLocation.z),
            };
            for(let i=playerLocations.length-1; i>=0; i--) {
                if(playerLocations[i].playerId === player.id) { playerLocations.splice(i, 1); }
            }
            playerLocations.push(
                {
                    location: oldLocation,
                    playerId: player.id
                }
            );
        }
    });
    loopIds.push({entityId: player.id, loopId: id2, type: "armorAbility"});
}
function nexusArmorAbility(player) {
    const index = getArmorIndex("nexus_armor");
    const ticksPerCheck = armorAttributes[index].ability1.ticksPerCheck;
    player.addTag("armorAbility:nexus_armor");
    let spinTime = 0;
    let summonTime = 0;
    let projList = [];
    const id = system.runInterval(() => {
        if(!player.isValid() || !player.hasTag("armorAbility:nexus_armor")) { return; }
        
        if(armorAttributes[index].ability1.active) {
            const location = player.location;
            const headLocation = player.getHeadLocation();
            const maxProj = armorAttributes[index].ability1.maxProjectiles;
            const spawnHeight = player.location.y + player.isSneaking ? armorAttributes[index].ability1.sneaking.spawnHeight : armorAttributes[index].ability1.normal.spawnHeight;
            const rStep = (2*Math.PI)/maxProj;
            const radius = player.isSneaking ? armorAttributes[index].ability1.sneaking.radius : armorAttributes[index].ability1.normal.radius;
            const spinAdd = (2*Math.PI)*(spinTime/120);
            const height = player.isSneaking ? armorAttributes[index].ability1.sneaking.height : armorAttributes[index].ability1.normal.height + Math.sin((2*Math.PI)*((spinTime%120)/120))*0.25;
            spinTime = player.isSneaking ? ((spinTime += 2*ticksPerCheck) % 120) : ((spinTime += 1*ticksPerCheck) % 120);
            if(projList.length < maxProj) { summonTime++; }
            //console.warn(loopIds);

            if(summonTime >= armorAttributes[index].ability1.summonTime/ticksPerCheck && projList.length < maxProj) { 
                const projectile = player.dimension.spawnEntity(armorAttributes[index].ability1.projectile, { x: location.x, y: headLocation.y+1.5, z: location.z });
                projectile.getComponent('minecraft:projectile').owner = player;
                setOwningIdentifier(projectile, player);
                projList.push(projectile);
                summonTime = 0;
            }
        
            const identifier = getScore(player, "identifier");
            const target = player.dimension.getEntities({location: location, maxDistance: armorAttributes[index].ability1.range, scoreOptions:[{objective: "nexus_hit_identifier", maxScore: identifier, minScore: identifier}]})[0];
            if(target) {
                const loc = {
                    x: headLocation.x,
                    y: headLocation.y+armorAttributes[index].ability1.normal.height,
                    z: headLocation.z
                }
                const targetLoc = target.getHeadLocation();
                const distance = Math.sqrt(Math.pow(targetLoc.x-loc.x,2)+Math.pow(targetLoc.y-loc.y,2)+Math.pow(targetLoc.z-loc.z,2));
                for(var i=0; i<loopIds.length; i++) {
                    if(loopIds[i].entityId === player.id && loopIds[i].type === "nexusProjectilesAttack") { break; }
                    if(i === loopIds.length-1) {
                        const queuedProjectiles = player.dimension.getEntities({type: armorAttributes[index].ability1.projectile, tags: ["yes:nexus_projectile_queued_attack"], scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]});
                        if(queuedProjectiles.length !== 0) {
                            let j = 0;
                            const attackId = system.runInterval(() => {
                                if(!player.isValid() || !player.hasTag("armorAbility:nexus_armor")) { return; }
                                const test = player.dimension.getEntities({type: armorAttributes[index].ability1.projectile, tags: ["yes:nexus_projectile_queued_attack"], scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]})[0];
                                if(test == undefined) {
                                    console.warn("stopped attack loop");
                                    system.clearRun(attackId);
                                    stopTimeout(player, "nexusProjectilesAttack");
                                    return;
                                }
                                queuedProjectiles[j].removeTag("yes:nexus_projectile_queued_attack");
                                queuedProjectiles[j].addTag("yes:nexus_projectile_attack");
                                queuedProjectiles[j].setProperty("property:is_attacking", true);
                                const xRand = (Math.random()*distance * (Math.round(Math.random()) == 1 ? 1 : -1) + Number.EPSILON);
                                const yRand = clamp((Math.random()*distance/3 * (Math.round(Math.random()) == 1 ? 1 : -1)), -6, 6);
                                queuedProjectiles[j].setProperty("property:x_random", xRand);
                                queuedProjectiles[j].setProperty("property:y_random", yRand);
                                j++;
                            }, armorAttributes[index].ability1.projectileDelay);
                            loopIds.push({entityId: player.id, loopId: attackId, type: "nexusProjectilesAttack"});
                        }
                    }
                }
                for(var i=0; i<loopIds.length; i++) {
                    if(loopIds[i].entityId === player.id && loopIds[i].type === "nexusProjectilesTargeting") { break; }
                    if(i === loopIds.length-1) {
                        if(!player.hasTag("yes:owner_nexus_projectile_attack")) { player.addTag("yes:owner_nexus_projectile_attack"); /*console.warn("added tag");*/ }
                        const targetingId = system.runInterval(() => {
                            if(!player.isValid() || !player.hasTag("armorAbility:nexus_armor")) { return; }
                            const target = player.dimension.getEntities({location: location, maxDistance: armorAttributes[index].ability1.range, scoreOptions:[{objective: "nexus_hit_identifier", maxScore: identifier, minScore: identifier}]})[0];
                            if(target === undefined) { 
                                system.clearRun(targetingId);
                                stopTimeout(player, "nexusProjectilesTargeting");
                                return;
                            }
                            const attackingProjectiles = player.dimension.getEntities({type: armorAttributes[index].ability1.projectile, tags: ["yes:nexus_projectile_attack"], scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]});
                            attackingProjectiles.forEach(projectile => {
                                if(!projectile.isValid()) { return; }
                                const rot = player.getRotation();
                                const loc = {
                                    x: headLocation.x,
                                    y: headLocation.y+armorAttributes[index].ability1.normal.height,
                                    z: headLocation.z
                                }
                                const targetLoc = target.getHeadLocation();
                                const distance = Math.sqrt(Math.pow(targetLoc.x-loc.x,2)+Math.pow(targetLoc.y-loc.y,2)+Math.pow(targetLoc.z-loc.z,2));
                                const maxTime = 3/4*Math.sqrt(distance/10);
                                const maxTick = Math.round(maxTime*20);
                                nexusProjectileTargeting(player, projectile, target, rot, loc, targetLoc, distance, maxTick); //crazy function that I don't know how to simplify
                            });
                        });
                        loopIds.push({entityId: player.id, loopId: targetingId, type: "nexusProjectilesTargeting"});
                    }
                }
            }
            const attackingProjectiles1 = player.dimension.getEntities({type: armorAttributes[index].ability1.projectile, tags: ["yes:nexus_projectile_attack"], scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]});
            const attackingProjectiles2 = player.dimension.getEntities({type: armorAttributes[index].ability1.projectile, tags: ["yes:nexus_projectile_queued_attack"], scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]});
            const attackingProjectiles = attackingProjectiles1.concat(attackingProjectiles2);
            //console.warn(`hastag: ${player.hasTag("yes:owner_nexus_projectile_attack")} length: ${attackingProjectiles.length} target: ${target}`);
            if((player.hasTag("yes:owner_nexus_projectile_attack") && attackingProjectiles.length === 0) || (player.hasTag("yes:owner_nexus_projectile_attack") && !target)) {
                console.warn(`reset`);
                player.removeTag("yes:owner_nexus_projectile_attack");
                if(target) { world.scoreboard.getObjective("nexus_hit_identifier").removeParticipant(target) };
                stopTimeout(player, "nexusProjectilesAttack");
                stopTimeout(player, "nexusProjectilesTargeting");
                for(let i=projList.length-1; i>=0; i--) {
                    if(!projList[i].isValid()) { projList.splice(i, 1); }
                }
                projList.forEach(projectile => {
                    projectile.setProperty("property:is_attacking", false);
                    projectile.removeTag("yes:nexus_projectile_queued_attack");
                    projectile.removeTag("yes:nexus_projectile_attack");
                });
            }
            //console.warn(`rot: ${horizontalRotation}, x: ${(horizontalSpeed*5*Math.sin(horizontalRotation/180*Math.PI))}, z: ${(horizontalSpeed*5*Math.cos(horizontalRotation/180*Math.PI))}`);
            for(let i=projList.length-1; i>=0; i--) {
                if(!projList[i].isValid()) { 
                    projList.splice(i, 1); 
                    continue; 
                }
                if(!projList[i].hasTag("yes:nexus_projectile_attack")) {
                    const tpOffset = { 
                        x: radius*Math.cos((Math.PI/2)+rStep*(i)+spinAdd),
                        y: headLocation.y-location.y + height, 
                        z: radius*Math.sin((Math.PI/2)+rStep*(i)+spinAdd)
                    };
                    let tpLocation = changeLocation(undefined, player, tpOffset.x, tpOffset.y, tpOffset.z, "^");
                    tpLocation = changeLocation(tpLocation, undefined, ((player.getVelocity().x*2.5*ticksPerCheck)), 0, ((player.getVelocity().z*2.5*ticksPerCheck)), "~");
                    projList[i].teleport(tpLocation, {dimension: player.dimension});
                }
            }
        }
    }, ticksPerCheck);
    loopIds.push({entityId: player.id, loopId: id, type: "armorAbility"});
}
function wardenArmorAbility(player) {
    const index = getArmorIndex("warden_armor");
    player.addTag("armorAbility:warden_armor");
    if(armorAttributes[index].initialEquip.active) {
        armorAttributes[index].initialEquip.sounds.forEach(obj => {
            player.playSound(obj.sound, {location: player.getHeadLocation(), volume: obj.volume, pitch: obj.pitch} );
        });
        if(armorAttributes[index].initialEquip.totalBlindness.active) {
            player.camera.fade({ fadeColor: {blue: 0, green: 0, red: 0}, fadeTime: {fadeInTime: 0, fadeOutTime: armorAttributes[index].initialEquip.totalBlindness.fadeTime/20, holdTime: armorAttributes[index].initialEquip.totalBlindness.holdTime/20 }});
        }
        player.addEffect(EffectTypes.get(armorAttributes[index].initialEquip.effect), armorAttributes[index].initialEquip.duration, { amplifier: 0, showParticles: false });
        const initialEquipId = system.runTimeout(() => {
            stopTimeout(player, "heartbeat");
            stopTimeout(player, "initialEquip");
            wardenArmorCont(player, index);
        }, armorAttributes[index].initialEquip.duration-3);
        loopIds.push({entityId: player.id, loopId: initialEquipId, type: "initialEquip"});
        const heartBeatId = system.runInterval(() => {
            if(!player.isValid() || !player.hasTag("armorAbility:warden_armor")) { return; }
            player.playSound(armorAttributes[index].initialEquip.sounds[2].sound, {location: player.getHeadLocation(), volume: armorAttributes[index].initialEquip.sounds[2].volume, pitch: armorAttributes[index].initialEquip.sounds[2].pitch} );
        }, armorAttributes[index].initialEquip.heartbeatInterval);
        loopIds.push({entityId: player.id, loopId: heartBeatId, type: "heartbeat"});
    }
    else {
        wardenArmorCont(player, index);
    }
}
function wardenArmorCont(player, index) {
    const ability1Id = system.runInterval(() => {
        if(!player.isValid() || !player.hasTag("armorAbility:warden_armor")) { return; }
        if(armorAttributes[index].ability1.active) {
            const targets = player.dimension.getEntities( { location: player.location, maxDistance: armorAttributes[index].ability1.range } );
            targets.forEach(target => {
                if(!isHostileEntity(target, player) || target.typeId === "minecraft:player") { return; }
                const humanoids = ["minecraft:creeper", "minecraft:drowned", "minecraft:enderman", "minecraft:evocation_illager", "minecraft:husk", "minecraft:piglin", "minecraft:piglin_brute", "minecraft:pillager", "minecraft:skeleton", "minecraft:stray", "minecraft:vindicator", "minecraft:witch", "minecraft:wither_skeleton", "minecraft:zombie", "minecraft:zombie_pigman", "minecraft:zombie_villager"];
                for(let i=0; i<humanoids.length; i++) {
                    if(target.typeId === humanoids[i]) {
                        const pingEntity = target.dimension.spawnEntity(armorAttributes[index].ability1.entity1, { x: target.location.x, y: target.location.y, z: target.location.z });
                        break;
                    }
                    else if(i === humanoids.length-1) {
                        const pingEntity = target.dimension.spawnEntity(armorAttributes[index].ability1.entity2, { x: target.location.x, y: target.location.y, z: target.location.z });
                    }
                }
                playSoundDynamic(target, armorAttributes[index].ability1.sound, armorAttributes[index].ability1.range, 0.5, 0.7);
            });
        }
    }, armorAttributes[index].ability1.ticksPerCheck);
    loopIds.push({entityId: player.id, loopId: ability1Id, type: "armorAbility"});  
    const ability2Id = system.runInterval(() => {
        if(!player.isValid() || !player.hasTag("armorAbility:warden_armor")) { return; }
        if(armorAttributes[index].ability2.active) {
            if(!player.getEffect(EffectTypes.get(armorAttributes[index].ability2.effect))) {
                player.addEffect(EffectTypes.get(armorAttributes[index].ability2.effect), maxEffectDuration, { amplifier: armorAttributes[index].ability2.level-1, showParticles: armorAttributes[index].ability2.showParticles });
            }
            armorAttributes[index].ability2.resistEffects.forEach(effectString => {
                if(player.getEffect(EffectTypes.get(effectString))) {
                    player.removeEffect(EffectTypes.get(effectString));
                }
            });
        }
    }, armorAttributes[index].ability2.ticksPerCheck);
    loopIds.push({entityId: player.id, loopId: ability2Id, type: "armorAbility"});
}
function aetheriteArmorAbility(player) {
    const index = getArmorIndex("aetherite_armor");
    player.addTag("armorAbility:aetherite_armor");
    if(armorAttributes[index].ability1.active) {
        player.addEffect(EffectTypes.get(armorAttributes[index].ability1.effect), maxEffectDuration, { amplifier: armorAttributes[index].ability1.level-1, showParticles: armorAttributes[index].ability1.showParticles.self });
    }
    if(armorAttributes[index].ability2.active) {
        player.addEffect(EffectTypes.get(armorAttributes[index].ability2.effect), maxEffectDuration, { amplifier: armorAttributes[index].ability2.level-1, showParticles: armorAttributes[index].ability2.showParticles });
    }
    const id = system.runInterval(() => {
        if(!player.isValid() || !player.hasTag("armorAbility:aetherite_armor")) { return; }
        if(armorAttributes[index].ability1.active) {
            const allies = player.dimension.getEntities( { location: player.location, maxDistance: armorAttributes[index].ability1.range } );
            allies.forEach(ally => {
                if(!isAlliedEntity(ally, player)) { return; }
                ally.addEffect(EffectTypes.get(armorAttributes[index].ability1.effect), armorAttributes[index].ability1.duration, { amplifier: armorAttributes[index].ability1.level-1, showParticles: armorAttributes[index].ability1.showParticles.other });
            });
        }
    }, armorAttributes[index].ability1.ticksPerCheck);
    loopIds.push({entityId: player.id, loopId: id, type: "armorAbility"});
}
function gildedNetheriteArmorAbility(player) {
    const index = getArmorIndex("gilded_netherite_armor");
    player.addTag("armorAbility:gilded_netherite_armor");
    if(armorAttributes[index].ability1.active) {
        player.addEffect(EffectTypes.get(armorAttributes[index].ability1.effect), maxEffectDuration, { amplifier: armorAttributes[index].ability1.level-1, showParticles: armorAttributes[index].ability1.showParticles });
    }
    //const id = system.runInterval(() => {
    //    if(!player.hasTag("armorAbility:gilded_netherite_armor")) { return; }
    //});
    //loopIds.push({entityId: player.id, loopId: id, type: "armorAbility"});
}
function reaperArmorAbility(player) {
    const index = getArmorIndex("reaper_armor");
    player.addTag("armorAbility:reaper_armor");

    if(armorAttributes[index].initialEquip.active) {
        let time = 0;
        const location = player.location;
        player.runCommand(`inputpermission set @s movement disabled`);
        const particleEntity = spawnCustomEntity(armorAttributes[index].initialEquip.particleEntity, player);
        setOwningIdentifier(particleEntity, player);
        player.runCommand(`fog @s push ${armorAttributes[index].initialEquip.fog} ${armorAttributes[index].initialEquip.name}`);
        playSoundDynamic(player, armorAttributes[index].initialEquip.sound, armorAttributes[index].initialEquip.soundRange);
        const initialEquipId = system.runInterval(() => {
            if(!player.isValid() || !player.hasTag("armorAbility:reaper_armor")) { return; }
            armorAttributes[index].initialEquip.camerashake.forEach(obj => {
                if(time >= obj.score.min && time <= obj.score.max) {
                    player.runCommandAsync(`camerashake add @s ${obj.intensity} ${obj.duration/20} rotational`);
                }
            });
            if(time >= armorAttributes[index].initialEquip.duration) {
                const nearbyEntities = player.dimension.getEntities( { location: location, maxDistance: armorAttributes[index].initialEquip.knockback.range } );
                nearbyEntities.forEach(entity => {
                    if(!isAttackableEntity(entity, player)) { return; }
                    applyCustomKnockback(entity, armorAttributes[index].initialEquip.knockback.horizontalKnockback, armorAttributes[index].initialEquip.knockback.verticalKnockback, player, false);
                });
                player.runCommand(`inputpermission set @s movement enabled`);
                player.runCommand(`fog @s remove ${armorAttributes[index].initialEquip.name}`);
                stopTimeout(player, "initialEquip");
                reaperArmorCont(player, index);
            }
            time++;
        });
        loopIds.push({entityId: player.id, loopId: initialEquipId, type: "initialEquip"});
    }
    else {
        reaperArmorCont(player, index);
    }
}
function reaperArmorCont(player, index) {
    const id = system.runInterval(() => {
        if(!player.isValid() || !player.hasTag("armorAbility:reaper_armor")) { return; }
        if(armorAttributes[index].ability1.active || armorAttributes[index].ability2.active) {
            let hasTarget = false;
            const rayCast = player.getEntitiesFromViewDirection({ maxDistance: armorAttributes[index].ability1.range });
            for(let i in rayCast) {
                const target = rayCast[i].entity;
                if(isAttackableEntity(target)) {
                    if(getScore(target, "reaper_timer") < 100 || getScore(target, "reaper_timer") === undefined) { world.scoreboard.getObjective("reaper_timer").addScore(target, 2); }
                    if(getScore(player, "user_reaper_timer") < 100) { world.scoreboard.getObjective("user_reaper_timer").addScore(player, 1); }
                    hasTarget = true;
                    break;
                }
            }
            const score = getScore(player, "user_reaper_timer");
            armorAttributes[index].ability1.levels.forEach(obj => {
                if(score >= obj.score && obj.affects === "self") { player.addEffect(EffectTypes.get(obj.effect.effect), obj.effect.duration, { amplifier: obj.effect.level-1, showParticles: obj.effect.showParticles }); }
            });
            if(score >= armorAttributes[index].ability1.fog.score && !player.hasTag("yes:has_reaper_fog")) { 
                player.runCommandAsync(`fog @s push ${armorAttributes[index].ability1.fog.fog} ${armorAttributes[index].ability1.fog.name.self}`); 
                player.addTag("yes:has_reaper_fog");
            }
            else if(score < armorAttributes[index].ability1.fog.score && player.hasTag("yes:has_reaper_fog")) {
                player.runCommandAsync(`fog @s remove ${armorAttributes[index].ability1.fog.name.self}`); 
                player.removeTag("yes:has_reaper_fog");
            }
            if(!hasTarget) {
                if(getScore(player, "user_reaper_timer") > 0) { world.scoreboard.getObjective("user_reaper_timer").addScore(player, -1); }
            }
        }
    }, armorAttributes[index].ability1.ticksPerCheck);
    loopIds.push({entityId: player.id, loopId: id, type: "armorAbility"});
}


function stopCopperArmorAbility(player) {
    console.warn("stopped copper armor ability");
    stopTimeout(player, "equipmentAbility", ["equipmentAbility:copper_armor"]);
}
function stopPhantomArmorAbility(player) {
    console.warn("stopped phantom armor ability");
    stopTimeout(player, "armorAbility", ["armorAbility:phantom_armor"]);
    player.removeEffect(EffectTypes.get('invisibility'));
    world.scoreboard.getObjective("phantom_invisibility").setScore(player, 0); 
}
function stopGlowingObsidianArmorAbility(player) {
    console.warn("stopped glowing obsidian armor ability");
    const index = getArmorIndex("glowing_obsidian_armor");
    stopTimeout(player, "armorAbility", ["armorAbility:glowing_obsidian_armor"]);
    let oldLocation;
    for(let i in playerLocations) {
        if(playerLocations[i].playerId === player.id) { oldLocation = playerLocations[i].location; break; }
    }
    player.runCommandAsync(`fill ${oldLocation.x} ${oldLocation.y} ${oldLocation.z} ${oldLocation.x} ${oldLocation.y} ${oldLocation.z} air replace ${armorAttributes[index].ability2.placeBlock}`);
    player.runCommandAsync(`fill ${oldLocation.x} ${oldLocation.y+2} ${oldLocation.z} ${oldLocation.x} ${oldLocation.y+2} ${oldLocation.z} air replace ${armorAttributes[index].ability2.placeBlock}`);
    for(let i in playerLocations) {
        if(playerLocations[i].playerId === player.id) { playerLocations.splice(i, 1); }
    }
}
function stopNexusArmorAbility(player) {
    console.warn("stopped nexus armor ability");
    stopTimeout(player, "armorAbility", ["armorAbility:nexus_armor", "yes:owner_nexus_projectile_attack"]);
    const index = getArmorIndex("nexus_armor");
    const identifier = getScore(player, "identifier");
    const nexusProjectiles = player.dimension.getEntities({type: armorAttributes[index].ability1.projectile, scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]});
    nexusProjectiles.forEach(projectile => {
        removeCustomEntity(projectile);
    });
    const targets = player.dimension.getEntities({scoreOptions:[{objective: "nexus_hit_identifier", maxScore: identifier, minScore: identifier}]});
    targets.forEach(target => {
        world.scoreboard.getObjective("nexus_hit_identifier").removeParticipant(target);
    });
}
function stopWardenArmorAbility(player) {
    console.warn("stopped warden armor ability");
    stopTimeout(player, "armorAbility", ["armorAbility:warden_armor"]);
    stopTimeout(player, "initialEquip");
    stopTimeout(player, "heartbeat");
    const index = getArmorIndex("warden_armor");
    player.removeEffect(EffectTypes.get(armorAttributes[index].ability2.effect));
    if(player.getEffect(EffectTypes.get(armorAttributes[index].initialEquip.effect))) {
        player.removeEffect(EffectTypes.get(armorAttributes[index].initialEquip.effect));
        player.addEffect(EffectTypes.get(armorAttributes[index].initialEquip.effect), 35, { amplifier: armorAttributes[index].initialEquip.level-1, showParticles: false });
    }
}
function stopAetheriteArmorAbility(player) {
    console.warn("stopped aetherite armor ability");
    stopTimeout(player, "armorAbility", ["armorAbility:aetherite_armor"]);
    const index = getArmorIndex("aetherite_armor");
    player.removeEffect(EffectTypes.get(armorAttributes[index].ability1.effect));
    player.removeEffect(EffectTypes.get(armorAttributes[index].ability2.effect));
}
function stopGildedNetheriteArmorAbility(player) {
    console.warn("stopped gilded netherite armor ability");
    player.removeTag("armorAbility:gilded_netherite_armor");
    //stopTimeout(player, "armorAbility", ["armorAbility:gilded_netherite_armor"]);
    const index = getArmorIndex("gilded_netherite_armor");
    player.removeEffect(EffectTypes.get(armorAttributes[index].ability1.effect));
}
function stopReaperArmorAbility(player) {
    console.warn("stopped reaper armor ability");
    stopTimeout(player, "armorAbility", ["armorAbility:reaper_armor"]);
    stopTimeout(player, "initialEquip");
    const index = getArmorIndex("reaper_armor");
    player.runCommand(`inputpermission set @s movement enabled`);
    player.runCommand(`fog @s remove ${armorAttributes[index].initialEquip.name}`);
    player.runCommandAsync(`fog @s remove ${armorAttributes[index].ability1.fog.name.self}`); 
    world.scoreboard.getObjective("user_reaper_timer").setScore(player, 0);
}

/** This object is used by the "equipment_attributes/list_of_equipment.js" exported armor object list.
*/
export const armorAbilities = {
    copperArmorAbility: copperArmorAbility,
    phantomArmorAbility: phantomArmorAbility,
    glowingObsidianArmorAbility: glowingObsidianArmorAbility,
    nexusArmorAbility: nexusArmorAbility,
    wardenArmorAbility: wardenArmorAbility,
    aetheriteArmorAbility: aetheriteArmorAbility,
    gildedNetheriteArmorAbility: gildedNetheriteArmorAbility,
    reaperArmorAbility: reaperArmorAbility,

    stopCopperArmorAbility: stopCopperArmorAbility,
    stopPhantomArmorAbility: stopPhantomArmorAbility,
    stopGlowingObsidianArmorAbility: stopGlowingObsidianArmorAbility,
    stopNexusArmorAbility: stopNexusArmorAbility,
    stopWardenArmorAbility: stopWardenArmorAbility,
    stopAetheriteArmorAbility: stopAetheriteArmorAbility,
    stopGildedNetheriteArmorAbility: stopGildedNetheriteArmorAbility,
    stopReaperArmorAbility: stopReaperArmorAbility
};


//template

/*
function <type>ArmorAbility(player) {
    const index = getArmorIndex("<type>_armor");
    player.addTag("armorAbility:<type>_armor");
    const id = system.runInterval(() => {
        if(!player.hasTag("armorAbility:<type>_armor")) { return; }
        if(armorAttributes[index].ability1.active) {

        }
    });
    loopIds.push({entityId: player.id, loopId: id, type: "armorAbility"});
}
    */
