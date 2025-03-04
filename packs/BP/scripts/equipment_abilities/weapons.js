//weapon abilities functions
import { world, system, ItemStack, EffectTypes } from '@minecraft/server';
import { getItemName, getTagName, getAllEquipment, getArrayIntersection, removeDuplicateEntities, isAttackableEntity, changeLocation, changeLocationFromViewDirection, distanceBetweenLocations, applyDurabilityDamage, applyAbilityDamage, applyCustomKnockback, playSoundDynamic, spawnCustomEntity, setOwningIdentifier, randomTeleport, getEntities, getScore, removeCustomEntity, hasItemTest, isCreative, getItemType } from "../basic_functions.js";
import { weaponAttributes, getWeaponIndex, getWeaponDamage } from "../equipment_attributes/weapons.js";
import { startCooldown } from './weapon_cooldown.js';
import { stopTimeout } from "./stop_timeout.js";
import { loopIds } from "../Main.js";
import { possibleCustomDeathMessage } from '../player_death/custom_death_messages.js';

const maxEffectDuration = 20000000;

function hammerAbility(player, itemStack) {
    const index = getWeaponIndex("hammer");
    system.runTimeout(() => { player.playAnimation(weaponAttributes[index].animation); }, 1);
    player.addTag(getTagName(itemStack));
    const id = system.runTimeout(() => {
        const newLocation = changeLocation(undefined, player, 0, 0, 2, "^");
        const targets = player.dimension.getEntities( { location: newLocation, maxDistance: weaponAttributes[index].ability.range } );
        targets.forEach( target => {
            if(!isAttackableEntity(target, player)) return;
            const damage = getWeaponDamage(itemStack, "abilityDamage");
            if(target.typeId === "minecraft:player") { possibleCustomDeathMessage(target, itemStack, player); }
            applyAbilityDamage(target, damage, "entityAttack", player);
            applyDurabilityDamage(player, itemStack, "Mainhand", weaponAttributes[index].ability.durabilityDamage);
        });
        playSoundDynamic(player, weaponAttributes[index].hitSound, weaponAttributes[index].soundRange);
        stopTimeout(player, "ability", [getTagName(itemStack)]);
    }, weaponAttributes[index].ability.windupTime);
    const soundId = system.runTimeout(() => {
        playSoundDynamic(player, weaponAttributes[index].attackSound, weaponAttributes[index].soundRange);
    }, weaponAttributes[index].ability.windupTime-4);
    stopTimeout(player, "animation");
    player.addTag("animation:weapon");
    const animationId = system.runTimeout(() => {
        stopTimeout(player, "animation", ["animation:weapon"]);
    }, weaponAttributes[index].animationDuration);
    loopIds.push({entityId: player.id, loopId: id, type: "ability"});
    loopIds.push({entityId: player.id, loopId: soundId, type: "ability"});
    loopIds.push({entityId: player.id, loopId: animationId, type: "animation"});
}
function spearAbility(player, itemStack) {
    const index = getWeaponIndex("spear");
    system.runTimeout(() => { player.playAnimation(weaponAttributes[index].animation); }, 1);
    player.addTag(getTagName(itemStack));
    const id = system.runTimeout(() => {
        const rayCast = player.getEntitiesFromViewDirection({ maxDistance: weaponAttributes[index].ability.range });
        playSoundDynamic(player, weaponAttributes[index].attackSound, weaponAttributes[index].soundRange);
        player.runCommand(`particle ${weaponAttributes[index].particle} ^^0.7^2`);
        rayCast.forEach( e => {
            const target = e.entity;
            if(!isAttackableEntity(target)) return;
            const damage = getWeaponDamage(itemStack, "abilityDamage");
            playSoundDynamic(target, weaponAttributes[index].hitSound, weaponAttributes[index].soundRange);
            if(target.typeId === "minecraft:player") { possibleCustomDeathMessage(target, itemStack, player); }
            applyAbilityDamage(target, damage, "entityAttack", player);
            applyDurabilityDamage(player, itemStack, "Mainhand", weaponAttributes[index].ability.durabilityDamage);
        });
        stopTimeout(player, "ability", [getTagName(itemStack)]);
    }, weaponAttributes[index].ability.windupTime);
    stopTimeout(player, "animation");
    player.addTag("animation:weapon");
    const animationId = system.runTimeout(() => {
        stopTimeout(player, "animation", ["animation:weapon"]);
    }, weaponAttributes[index].animationDuration);
    loopIds.push({entityId: player.id, loopId: id, type: "ability"});
    loopIds.push({entityId: player.id, loopId: animationId, type: "animation"});
}
function whipAbility(player, itemStack) {
    const index = getWeaponIndex("whip");
    system.runTimeout(() => { player.playAnimation(weaponAttributes[index].animation); }, 1);
    player.addTag(getTagName(itemStack));
    const id = system.runTimeout(() => {
        let hasTarget = false;
        const rayCast = player.getEntitiesFromViewDirection({ maxDistance: weaponAttributes[index].ability.range });
        for(let i in rayCast) {
            const target = rayCast[i].entity;
            const distance = rayCast[i].distance;

            if(!isAttackableEntity(target) && !(target.getComponent("minecraft:projectile")??0)) continue;
            if(target.getComponent("minecraft:projectile")??0) { target.remove(); continue; }
            var lastParticleLocation = changeLocationFromViewDirection(player, distance);
            var particleDistance = 1;
            var currentLocation = changeLocationFromViewDirection(player, particleDistance);
            while(distanceBetweenLocations(currentLocation, lastParticleLocation) > 1) {
                player.runCommand(`particle ${weaponAttributes[index].particle} ${currentLocation.x} ${currentLocation.y} ${currentLocation.z}`);
                particleDistance++;
                currentLocation = changeLocationFromViewDirection(player, particleDistance);
            }
            const damage = getWeaponDamage(itemStack, "abilityDamage");
            playSoundDynamic(target, weaponAttributes[index].hitSound, weaponAttributes[index].soundRange);
            if(target.typeId === "minecraft:player") { possibleCustomDeathMessage(target, itemStack, player); }
            applyAbilityDamage(target, damage, "entityAttack", player);
            applyCustomKnockback(target, weaponAttributes[index].ability.horizontalKnockback, weaponAttributes[index].ability.verticalKnockback, player, weaponAttributes[index].ability.trueKnockback);
            applyDurabilityDamage(player, itemStack, "Mainhand", weaponAttributes[index].ability.durabilityDamage);
            hasTarget = true;
            break;
        }
        if(!hasTarget) {
            var lastParticleLocation = changeLocationFromViewDirection(player, 10);
            var particleDistance = 1;
            var currentLocation = changeLocationFromViewDirection(player, particleDistance);
            while(distanceBetweenLocations(currentLocation, lastParticleLocation) > 1) {
                player.runCommand(`particle ${weaponAttributes[index].particle} ${currentLocation.x} ${currentLocation.y} ${currentLocation.z}`);
                particleDistance++;
                currentLocation = changeLocationFromViewDirection(player, particleDistance);
            }
        }
        stopTimeout(player, "ability", [getTagName(itemStack)]);
    }, weaponAttributes[index].ability.windupTime);
    const soundId = system.runTimeout(() => {
        playSoundDynamic(player, weaponAttributes[index].attackSound, weaponAttributes[index].soundRange);
    }, weaponAttributes[index].ability.windupTime-8);
    stopTimeout(player, "animation");
    player.addTag("animation:weapon");
    let time = 0;
    const animationId = system.runInterval(() => {
        if(time >= weaponAttributes[index].animationDuration) { 
            world.scoreboard.getObjective("whip_animation").setScore(player, 0);
            stopTimeout(player, "animation", ["animation:weapon"]); 
            return; 
        }
        for(let i in weaponAttributes[index].animationStates) {
            if(time === weaponAttributes[index].animationStates[i].time) { 
                world.scoreboard.getObjective("whip_animation").setScore(player, weaponAttributes[index].animationStates[i].state);
                break;
            }
        }
        time++;
    });
    loopIds.push({entityId: player.id, loopId: id, type: "ability"});
    loopIds.push({entityId: player.id, loopId: soundId, type: "ability"});
    loopIds.push({entityId: player.id, loopId: animationId, type: "animation"});
}
function battleaxeAbility(player, itemStack) {
    const index = getWeaponIndex("battleaxe");
    system.runTimeout(() => { player.playAnimation(weaponAttributes[index].animation); }, 1);
    player.addTag(getTagName(itemStack));
    player.addEffect(EffectTypes.get(weaponAttributes[index].ability.effect.effect), weaponAttributes[index].ability.effect.duration, { amplifier: weaponAttributes[index].ability.effect.level-1, showParticles: weaponAttributes[index].ability.effect.showParticles }); 
    const id = system.runTimeout(() => {
        const location = player.location;
        const newLocation1 = changeLocation(undefined, player, -3, 0, 3, "^");
        const newLocation2 = changeLocation(undefined, player, 3, 0, 3, "^");
        const targets1 = player.dimension.getEntities( { location: location, maxDistance: weaponAttributes[index].ability.range } );
        const targets2 = player.dimension.getEntities( { location: newLocation1, maxDistance: 3.5 } );
        const targets3 = player.dimension.getEntities( { location: newLocation2, maxDistance: 3.5 } );
        const targets = getArrayIntersection(removeDuplicateEntities(targets2, targets3), targets1);
        player.runCommand(`particle ${weaponAttributes[index].particle} ^^^2`);
        targets.forEach( target => {
            if(!isAttackableEntity(target, player)) return;
            const damage = getWeaponDamage(itemStack, "abilityDamage");
            playSoundDynamic(player, weaponAttributes[index].hitSound, weaponAttributes[index].soundRange);
            if(target.typeId === "minecraft:player") { possibleCustomDeathMessage(target, itemStack, player); }
            applyAbilityDamage(target, damage, "entityAttack", player);
            applyCustomKnockback(target, weaponAttributes[index].ability.horizontalKnockback, weaponAttributes[index].ability.verticalKnockback, player, false);
            applyDurabilityDamage(player, itemStack, "Mainhand", weaponAttributes[index].ability.durabilityDamage);
        });
        stopTimeout(player, "ability", [getTagName(itemStack)]);
    }, weaponAttributes[index].ability.windupTime);
    const soundId = system.runTimeout(() => {
        playSoundDynamic(player, weaponAttributes[index].attackSound, weaponAttributes[index].soundRange);
    }, weaponAttributes[index].ability.windupTime-3);
    stopTimeout(player, "animation");
    player.addTag("animation:weapon");
    const animationId = system.runTimeout(() => {
        stopTimeout(player, "animation", ["animation:weapon"]);
    }, weaponAttributes[index].animationDuration);
    loopIds.push({entityId: player.id, loopId: id, type: "ability"});
    loopIds.push({entityId: player.id, loopId: soundId, type: "ability"});
    loopIds.push({entityId: player.id, loopId: animationId, type: "animation"});
}
function morningstarAbility(player, itemStack) {
    const index = getWeaponIndex("morningstar");
    const location = changeLocation(undefined, player, 0, 0, 1.8, "^");
    const targets = player.dimension.getEntities( { location: location, maxDistance: weaponAttributes[index].ability.range } );
    system.runTimeout(() => { player.playAnimation(weaponAttributes[index].animation); }, 1);
    playSoundDynamic(player, weaponAttributes[index].attackSound, weaponAttributes[index].soundRange);
    targets.forEach( target => {
        if(!isAttackableEntity(target, player)) return;
        //const dir = target.getViewDirection();
        //const velo = target.getVelocity();
        if(target.typeId === "minecraft:player") { target.teleport(target.location, {rotation: {x:target.getRotation().x+20, y:target.getRotation().y}}); }
        else { target.teleport(target.location, {rotation: {x:target.getRotation().x+90, y:target.getRotation().y}}); }
        //target.applyKnockback(dir.x, dir.z, Math.sqrt(velo.x**2+velo.z**2), 0);
        const damage = getWeaponDamage(itemStack, "abilityDamage");
        playSoundDynamic(target, weaponAttributes[index].hitSound, weaponAttributes[index].soundRange);
        if(target.typeId === "minecraft:player") { possibleCustomDeathMessage(target, itemStack, player); }
        applyAbilityDamage(target, damage, "entityAttack", target);
        applyDurabilityDamage(player, itemStack, "Mainhand", weaponAttributes[index].ability.durabilityDamage);
        if(target.typeId === "minecraft:player") {
            const stunDuration = getWeaponDamage(itemStack, "abilityEffectDuration");
            weaponAttributes.forEach(obj => {
                target.startItemCooldown(obj.type, stunDuration);
            });
        }
    });
    stopTimeout(player, "animation");
    player.addTag("animation:weapon");
    const animationId = system.runTimeout(() => {
        stopTimeout(player, "animation", ["animation:weapon"]);
    }, weaponAttributes[index].animationDuration);
    loopIds.push({entityId: player.id, loopId: animationId, type: "animation"});
}
function scytheAbility(player, itemStack) {
    const index = getWeaponIndex("scythe");
    const identifier = world.scoreboard.getObjective("identifier").getScore(player);
    const target = player.dimension.getEntities({ location: player.location, maxDistance: weaponAttributes[index].ability.range, closest: 1, tags: ["yes:scythe_ability_target"], scoreOptions: [{exclude: true, objective: "identifier", minScore: identifier, maxScore: identifier}] })[0];
    const outOfRangeTarget = player.dimension.getEntities({ location: player.location, maxDistance: 70, closest: 1, tags: ["yes:scythe_ability_target"], scoreOptions: [{exclude: true, objective: "identifier", minScore: identifier, maxScore: identifier}] })[0];
    if(target != undefined) {
        applyDurabilityDamage(player, itemStack, "Mainhand", weaponAttributes[index].ability.durabilityDamage);
        const particleEntity = spawnCustomEntity("yes:scythe_hit_particle_entity", target);
        setOwningIdentifier(particleEntity, target);
        particleEntity.runCommand(`tp @s ~~~ facing @p[scores={identifier=${identifier}}]`);
        const targetHp = target.getComponent('health').currentValue;
        const percent = getWeaponDamage(itemStack, "abilityDamage")/100;
        const damage = Math.ceil(targetHp*percent);
        const id = system.runTimeout(() => {
            playSoundDynamic(target, weaponAttributes[index].attackSound, weaponAttributes[index].soundRange);
            if(!isAttackableEntity(target, player)) { return; }
            if(target.typeId === "minecraft:player") { possibleCustomDeathMessage(target, itemStack, player); }
            applyAbilityDamage(target, damage, "void");
            if((world.scoreboard.getObjective("reaper_timer").getScore(target) ?? 0) <= 38) { 
                target.removeTag(`yes:scythe_ability_target`); 
                const targetIdentifier = getScore(target, "identifier");
                const particleEntities = getEntities("yes:reaper_aura_particle_entity", undefined, "owning_identifier", targetIdentifier, targetIdentifier);
                particleEntities.forEach(entity => {
                    removeCustomEntity(entity);
                });
            }
            stopTimeout(player, "ability", [getTagName(itemStack)]);
        }, weaponAttributes[index].ability.windupTime);
        const cooldown = weaponAttributes[index].ability.cooldown;
        startCooldown(player, itemStack, cooldown, "ability", false, false);
        loopIds.push({entityId: player.id, loopId: id, type: "ability"});
    }
    else if(outOfRangeTarget != undefined) {
        player.onScreenDisplay.setActionBar(`§cTarget Not In Range`);
    }
    else if(target == undefined) {
        player.onScreenDisplay.setActionBar(`§cNo Target`);
    }
}
function echoStaffAbility(player, itemStack) {
    const index = getWeaponIndex("echo_staff");
    system.runTimeout(() => { player.playAnimation(weaponAttributes[index].animation); }, 1);
    player.addTag(getTagName(itemStack));
    const timeoutId = system.runTimeout(() => {
        var duration = 0;
        const tpEntity = spawnCustomEntity("yes:echo_staff_random_tp_entity", player);
        const sonicBoomEntity = spawnCustomEntity("yes:echo_staff_sonic_boom_entity", player);
        setOwningIdentifier(tpEntity, player);
        setOwningIdentifier(sonicBoomEntity, player);
        const loopId = system.runInterval(() => {
            duration++;
            const location = player.location;
            const targets = player.dimension.getEntities( { location: location, maxDistance: weaponAttributes[index].ability.range } );
            var hitEntity = false;
            for(let i in targets) {
                const target = targets[i];
                if(!isAttackableEntity(target, player) || target.typeId === "yes:echo_staff_sonic_boom_entity" || target.typeId === "yes:echo_staff_random_tp_entity") { continue; }
                const targetLocation = target.location;
                const distance = Math.sqrt((location.x-targetLocation.x)**2 + (location.y-targetLocation.y)**2 + (location.z-targetLocation.z)**2);
                const chanceOfHitting = Math.round((-0.009*(distance**2)+1)*100)/100;
                if(Math.random() <= chanceOfHitting) {
                    tpEntity.teleport(targetLocation, {dimension: target.dimension});
                    const damage = getWeaponDamage(itemStack, "abilityDamage");
                    if(target.typeId === "minecraft:player") { possibleCustomDeathMessage(target, itemStack, player); }
                    applyAbilityDamage(target, damage, "entityExplosion", player);
                    applyCustomKnockback(target, weaponAttributes[index].ability.horizontalKnockback, weaponAttributes[index].ability.verticalKnockback, player, true);
                    applyDurabilityDamage(player, itemStack, "Mainhand", weaponAttributes[index].ability.durabilityDamage);
                    hitEntity = true;
                    break;
                }
                //console.warn(`chance:${chanceOfHitting} for ${target.typeId}`);
            }
            if(!hitEntity && tpEntity.isValid()) {
                randomTeleport(tpEntity, location, weaponAttributes[index].ability.range-3);
            }
            playSoundDynamic(player, weaponAttributes[index].attackSound, weaponAttributes[index].soundRange, 0.7, 1.1);
            if(duration >= weaponAttributes[index].ability.duration/weaponAttributes[index].ability.attackInterval) { stopTimeout(player, "ability"); }
        }, weaponAttributes[index].ability.attackInterval);
        stopTimeout(player, "ability");
        loopIds.push({entityId: player.id, loopId: loopId, type: "ability"});
    }, weaponAttributes[index].ability.windupTime);
    stopTimeout(player, "animation");
    player.addTag("animation:weapon");
    const animationId = system.runTimeout(() => {
        stopTimeout(player, "animation", ["animation:weapon"]);
    }, weaponAttributes[index].animationDuration);
    loopIds.push({entityId: player.id, loopId: timeoutId, type: "ability"});
    loopIds.push({entityId: player.id, loopId: animationId, type: "animation"});
}

function daggerHitAbility(player, itemStack, target) {
    if(!isAttackableEntity(target)) { return; }
    if(target.typeId === "minecraft:player") { possibleCustomDeathMessage(target, itemStack, player); }
    const index = getWeaponIndex("dagger");
    if(!player.isFalling) { 
        const duration = getWeaponDamage(itemStack, "hitEffectDuration");
        target.addEffect(EffectTypes.get('fatal_poison'), duration, { amplifier: 1, showParticles: false }); 
    }
    else { 
        const duration = getWeaponDamage(itemStack, "abilityEffectDuration");
        target.addEffect(EffectTypes.get('fatal_poison'), duration, { amplifier: 1, showParticles: false }); 
    }
    playSoundDynamic(player, weaponAttributes[index].hitSound, weaponAttributes[index].soundRange);
}
function greatswordHitAbility(player, itemStack) {
    if(player.hasTag("hitCooldown:greatsword")) { return; }
    const index = getWeaponIndex("greatsword");
    const location = player.location;
    const newLocation1 = changeLocation(undefined, player, -3, 0, 3, "^");
    const newLocation2 = changeLocation(undefined, player, 3, 0, 3, "^");
    const targets1 = player.dimension.getEntities( { location: location, maxDistance: weaponAttributes[index].hitAbility.range } ).slice(0, 5);
    const targets2 = player.dimension.getEntities( { location: newLocation1, maxDistance: 3.8 } );
    const targets3 = player.dimension.getEntities( { location: newLocation2, maxDistance: 3.8 } );
    const targets = getArrayIntersection(removeDuplicateEntities(targets2, targets3), targets1);
    playSoundDynamic(player, weaponAttributes[index].attackSound, weaponAttributes[index].soundRange);
    targets.forEach( target => {
        if(!isAttackableEntity(target, player)) return;
        const damage = getWeaponDamage(itemStack, "hitDamage");
        playSoundDynamic(target, weaponAttributes[index].hitSound, weaponAttributes[index].soundRange);
        if(target.typeId === "minecraft:player") { possibleCustomDeathMessage(target, itemStack, player); }
        applyAbilityDamage(target, damage, "entityAttack", player);
        applyDurabilityDamage(player, itemStack, "Mainhand", weaponAttributes[index].hitAbility.durabilityDamage);
    });
    if(player.hasTag("animation:greatsword_right_swing")) { 
        system.runTimeout(() => { player.playAnimation(weaponAttributes[index].animation3); }, 1);
        player.removeTag("animation:greatsword_right_swing"); 
        player.runCommand(`particle ${weaponAttributes[index].particle1} ^^0.2^2.85`); 
    }
    else if(player.hasTag("animation:greatsword_left_swing")) { 
        system.runTimeout(() => { player.playAnimation(weaponAttributes[index].animation2); }, 1);
        player.addTag("animation:greatsword_right_swing"); 
        player.runCommand(`particle ${weaponAttributes[index].particle2} ^^0.2^2.85`); 
    }
    else if(!player.hasTag("animation:greatsword_left_swing")) { 
        system.runTimeout(() => { player.playAnimation(weaponAttributes[index].animation1); }, 1);
        player.addTag("animation:greatsword_left_swing"); 
        player.runCommand(`particle ${weaponAttributes[index].particle1} ^^0.2^2.85`); 
    }
    stopTimeout(player, "animation");
    player.addTag("animation:weapon");
    const animationId = system.runTimeout(() => {
        stopTimeout(player, "animation", ["animation:weapon", "animation:greatsword_left_swing", "animation:greatsword_right_swing", "animation:greatsword_left_swing_connected"]);
    }, weaponAttributes[index].animationDuration);
    loopIds.push({entityId: player.id, loopId: animationId, type: "animation"});
    const cooldown = weaponAttributes[index].hitAbility.cooldown;
    startCooldown(player, itemStack, cooldown, "hit", true, false);
}
function morningstarHitAbility(player, itemStack, target) {
    //const index = getWeaponIndex("morningstar");
    if(!isAttackableEntity(target)) { return; }
    if(target.typeId === "minecraft:player") { 
        const targetEquipment = getAllEquipment(target);
        var usingShield = false;
        var numOfEquipment = 0;
        targetEquipment.forEach(obj => {
            if(obj.item !== undefined) {
                numOfEquipment++;
                if(target.isSneaking && obj.item.typeId.includes("shield")) { usingShield = true; }
            }
        });
        const damage = getWeaponDamage(itemStack, "hitDamage");
        const durabilityDamageEach = Math.round(damage/numOfEquipment);
        for(let i in targetEquipment) {
            if(usingShield && targetEquipment[i].item !== undefined) {
                if(targetEquipment[i].item.typeId.includes("shield")) { applyDurabilityDamage(target, targetEquipment[i].item, targetEquipment[i].slot, damage); break; }
            }
            else if(!usingShield && targetEquipment[i].item !== undefined) {
                applyDurabilityDamage(target, targetEquipment[i].item, targetEquipment[i].slot, durabilityDamageEach );
            }
        }
    }
    else { 
        //doesn't work with other mobs just yet
    }
}
function scytheHitAbility(player, itemStack, target) {
    if(player.hasTag("hitCooldown:scythe")) { return; }
    if(!isAttackableEntity(target)) { return; }
    const index = getWeaponIndex("scythe");
    player.addEffect(EffectTypes.get('weakness'), weaponAttributes[index].hitAbility.cooldown, { amplifier: 255, showParticles: false }); 
    playSoundDynamic(target, weaponAttributes[index].hitSound, weaponAttributes[index].soundRange/2);
    const viewDirection = player.getViewDirection();
    target.applyKnockback(-viewDirection.x, -viewDirection.z, weaponAttributes[index].hitAbility.pullStrength, weaponAttributes[index].hitAbility.pullStrength/10);
    world.scoreboard.getObjective("scythe_timer").setScore(target, 200);
    if(!target.hasTag("yes:scythe_ability_target")) {
        const particleEntity = spawnCustomEntity("yes:reaper_aura_particle_entity", target);
        particleEntity.teleport(target.getHeadLocation());
        setOwningIdentifier(particleEntity, target);
    }
    target.addTag("yes:scythe_ability_target");
    const cooldown = weaponAttributes[index].hitAbility.cooldown;
    startCooldown(player, itemStack, cooldown, "hit", false, true);
    const illegalEnchantments = [ "sharpness", "bane_of_arthropods", "smite", "fire_aspect" ];
    for(let i in illegalEnchantments) {
        if(itemStack.getComponent("minecraft:enchantable")?.hasEnchantment(illegalEnchantments[i]) ?? false) {
            const entity = spawnCustomEntity("yes:empty_hit_entity", player);
            setOwningIdentifier(entity, player);
            console.warn(`has enchantment: ${illegalEnchantments[i]}`);
            break;
        }
    }
}
function nexusBowHitAbility(player, itemStack) {
    const hasArrow = hasItemTest(player, ["minecraft:arrow"]);
    if(!hasArrow && !isCreative(player)) { return; }
    player.addTag(getTagName(itemStack));
    let chargeTime = 0;
    const id = system.runInterval(() => {
        if(chargeTime >= 25) {
            player.addEffect(EffectTypes.get('slowness'), maxEffectDuration, { amplifier: 4, showParticles: false });
            player.addEffect(EffectTypes.get('speed'), maxEffectDuration, { amplifier: 14, showParticles: false });
        }
        else if(chargeTime >= 22) {
            player.addEffect(EffectTypes.get('slowness'), maxEffectDuration, { amplifier: 3, showParticles: false });
            player.addEffect(EffectTypes.get('speed'), maxEffectDuration, { amplifier: 6, showParticles: false });
        }
        else if(chargeTime >= 18) {
            player.addEffect(EffectTypes.get('slowness'), maxEffectDuration, { amplifier: 2, showParticles: false });
            player.addEffect(EffectTypes.get('speed'), maxEffectDuration, { amplifier: 3, showParticles: false });
        }
        else if(chargeTime >= 13) {
            player.addEffect(EffectTypes.get('slowness'), maxEffectDuration, { amplifier: 1, showParticles: false });
            player.addEffect(EffectTypes.get('speed'), maxEffectDuration, { amplifier: 1, showParticles: false });
        }
        else if(chargeTime >= 7) {
            player.addEffect(EffectTypes.get('slowness'), maxEffectDuration, { amplifier: 0, showParticles: false });
            player.addEffect(EffectTypes.get('speed'), maxEffectDuration, { amplifier: 0, showParticles: false });
        }
        chargeTime++;
    });
    loopIds.push({entityId: player.id, loopId: id, type: "ability"});
}

/** This object is used by the "equipment_attributes/list_of_equipment.js" exported weapons object list.
*/
export const weaponAbilities = {
    hammerAbility: hammerAbility,
    spearAbility: spearAbility,
    whipAbility: whipAbility,
    battleaxeAbility: battleaxeAbility,
    morningstarAbility: morningstarAbility,
    scytheAbility: scytheAbility,
    echoStaffAbility: echoStaffAbility,

    daggerHitAbility: daggerHitAbility,
    greatswordHitAbility: greatswordHitAbility,
    morningstarHitAbility: morningstarHitAbility,
    scytheHitAbility: scytheHitAbility,
    nexusBowHitAbility: nexusBowHitAbility  //nexus bow's hit ability is its arrows
};