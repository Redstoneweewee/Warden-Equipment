import { world, system, EffectTypes, ItemStack } from "@minecraft/server";
import { Vector3 } from "../resources/Vector3.js";
import { setHitIdentifier, getItemType, playSoundDynamic, randomNum, hasItemTest, isCreative, applyDurabilityDamage, getAllEquipment, getScore, getArmorType, isAttackableEntity, getPowerEnchantMultiplier, clamp } from "../basic_functions.js";
import { weaponAttributes, getWeaponIndex, getWeaponDamage } from "../equipment_attributes/weapons.js";
import { armorAttributes, getArmorIndex } from "../equipment_attributes/armor.js";
import { stopTimeout, additionalFunctions } from "./stop_timeout.js";
import { listOfEquipmentTypes } from "../equipment_attributes/list_of_equipment_types.js";
import { possibleCustomDeathMessage } from "../player_death/custom_death_messages.js";

var Vector = new Vector3();

//for the nexus bow --------------
world.afterEvents.itemReleaseUse.subscribe((eventData) => {
    const itemStack = eventData.itemStack;
    const itemType = getItemType(itemStack);
    if(itemType !== "nexus_bow") { return; }
    const player = eventData.source;
    const hasArrow = hasItemTest(player, ["minecraft:arrow"]);
    if(!hasArrow && !isCreative(player)) { return; }
    const index = getWeaponIndex(itemType);
    for(let i in listOfEquipmentTypes.weapons) {
        const type = listOfEquipmentTypes.weapons[i].type;
        if(type === itemType) { 
            additionalFunctions(player, listOfEquipmentTypes.weapons[i].additionalFunctions); 
            stopTimeout(player, "ability", [`ability:${type}`]);
            break;
        }
    }
    if(!isCreative(player)) {
        let alreadyRemoved = false;
        const offhandItemStack = player.getComponent("minecraft:equippable")?.getEquipmentSlot("Offhand") ?? undefined;
        try { 
            if(offhandItemStack.typeId === "minecraft:arrow") {
                const amount = offhandItemStack.amount;
                if(amount-1 === 0) { player.getComponent("minecraft:equippable").setEquipment("Offhand", undefined); }
                else { player.getComponent("minecraft:equippable").getEquipmentSlot("Offhand").amount = amount-1; }
                alreadyRemoved = true;
            }
        } catch{ }
        if(!alreadyRemoved) {
            const container = player.getComponent('minecraft:inventory')?.container;
            for(let i=0; i<container.size; i++) {
                if((container.getItem(i)?.typeId ?? "") === "minecraft:arrow") {
                    const itemStack = container.getItem(i);
                    const amount = itemStack.amount;
                    if(amount-1 === 0) { container.setItem(i, undefined); }
                    else { 
                        container.getSlot(i).amount = amount-1; 
                    }
                    break;
                }
            }
        }
        applyDurabilityDamage(player, itemStack, "Mainhand", weaponAttributes[index].hitAbility.durabilityDamage);
    }
    const maxUseDuration = weaponAttributes[index].hitAbility.windupTime;
    const useDuration = (99999*20 - eventData.useDuration) > maxUseDuration ? maxUseDuration : (99999*20 - eventData.useDuration); //in ticks
    playSoundDynamic(player, weaponAttributes[index].attackSound, weaponAttributes[index].soundRange);
    let viewDirection = player.getViewDirection();
    const playerRotation = player.getRotation();
    if (playerRotation.x > 30) { viewDirection.x *= 2.1; viewDirection.y *= 2.1; viewDirection.z *= 2.1; }
    const newLocation = Vector.addVectors(player.getHeadLocation(), viewDirection);
    const multiplier = useDuration === maxUseDuration ? weaponAttributes[index].hitAbility.criticalMultiplier : 1;
    const power = useDuration/maxUseDuration*weaponAttributes[index].hitAbility.maxPower;
    const spread = weaponAttributes[index].hitAbility.spread;
    const powerMultiplier = getPowerEnchantMultiplier(itemStack);
    const a = getWeaponDamage(itemStack, "hitDamage")/(weaponAttributes[index].hitAbility.criticalMultiplier*weaponAttributes[index].hitAbility.maxPower);
    const damage = Math.round(power*a*multiplier) === 0 ? 1*powerMultiplier : Math.round(power*a*multiplier)*powerMultiplier;
    const nexusProjectileDamage = getWeaponDamage(itemStack, "abilityDamage");

    const projectile = player.dimension.spawnEntity(weaponAttributes[index].hitAbility.projectile, { 'x': newLocation.x, 'y': newLocation.y, 'z': newLocation.z });
    projectile.setRotation({ x: -playerRotation.x, y: -playerRotation.y});
    const shootVector = new Vector.constructor((viewDirection.x+randomNum(-spread, spread)) * power, (viewDirection.y+randomNum(-spread, spread)) * power, (viewDirection.z+randomNum(-spread, spread)) * power);
    projectile.getComponent('minecraft:projectile').owner = player;
    projectile.getComponent('minecraft:projectile').shoot(shootVector);
    projectile.setProperty("property:damage", damage);
    projectile.setProperty("property:nexus_projectile_damage", nexusProjectileDamage);
    projectile.setProperty("property:horizontal_knockback", weaponAttributes[index].hitAbility.horizontalKnockback);
    projectile.setProperty("property:vertical_knockback", weaponAttributes[index].hitAbility.verticalKnockback);
    if(multiplier === weaponAttributes[index].hitAbility.criticalMultiplier) { projectile.setProperty("property:is_critical", true); }
});

world.afterEvents.projectileHitEntity.subscribe(async (eventData) => {
    const projectile = eventData.projectile;
    if((projectile.typeId !== weaponAttributes[getWeaponIndex("nexus_bow")].hitAbility.projectile && projectile.typeId !== armorAttributes[getArmorIndex("nexus_armor")].ability1.projectile) || !projectile.isValid()) { return; }
    const target = eventData.getEntityHit().entity;
    if(!isAttackableEntity(target)) { return; }
    if((target?.getComponent("minecraft:type_family")?.hasTypeFamily("projectile_immune") ?? false)) { //mainly for reaper skeletons
        target.applyDamage(1, { damagingProjectile: projectile} );
        return; 
    }
    const player = eventData.source;
    const equipment = getAllEquipment(player);
    const hitVector = eventData.hitVector;

    if(projectile.typeId === weaponAttributes[getWeaponIndex("nexus_bow")].hitAbility.projectile) {
        const damage = projectile.getProperty("property:damage");
        const horizontalKnockback = projectile.getProperty("property:horizontal_knockback");
        const verticalKnockback = projectile.getProperty("property:vertical_knockback");
        if(target.typeId === "minecraft:player") { possibleCustomDeathMessage(target, new ItemStack("yes:nexus_bow"), player); }
        target.applyDamage(damage, { damagingProjectile: projectile} );
        target.applyKnockback(hitVector.x, hitVector.z, clamp(Math.round(Math.sqrt(horizontalKnockback*damage)*100)/100, 0, 2.68), clamp(Math.round(verticalKnockback*100)/100*damage/12, 0, 0.4));
        console.warn(`applied ${damage} damage and ${Math.round(Math.sqrt(horizontalKnockback*damage)*100)/100},${Math.round(verticalKnockback*100)/100} knockback to ${target.typeId}`);
        for(let i=0; i<4; i++) {
            if(getArmorType(equipment[i].item) !== "nexus_armor") { 
                break; 
            }
            if(i === 3) {
                setHitIdentifier(target, player, "nexus");
                const index = getArmorIndex("nexus_armor");
                const identifier = getScore(player, "identifier");
                const nexusProjectiles = player.dimension.getEntities({type: armorAttributes[index].ability1.projectile, scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]});
                nexusProjectiles.forEach(proj => {
                    if(proj.hasTag("yes:nexus_projectile_attack")) { return; }
                    proj.addTag("yes:nexus_projectile_queued_attack");
                    proj.setProperty("property:damage", projectile.getProperty("property:nexus_projectile_damage"));
                });
            }
        }
    }
    else {
        const index = getArmorIndex("nexus_armor");
        const damage = projectile.getProperty("property:damage");
        console.warn(damage);
        const nexusProjectileAttacking = projectile.hasTag("yes:nexus_projectile_attack");
        const targetUsingShield = target.isSneaking && (equipment[4].item.typeId.includes("shield") || equipment[5].item.typeId.includes("shield"));
        if(targetUsingShield)                                    { target.applyDamage(damage*5, { damagingProjectile: projectile} ); }
        else if(nexusProjectileAttacking && !targetUsingShield)  { target.applyDamage(damage, { damagingEntity: player, cause: "override" } ); }
        else if(!nexusProjectileAttacking && !targetUsingShield) { target.applyDamage(armorAttributes[index].ability1.damage, { damagingEntity: player, cause: "entityAttack" } ); }
        if(nexusProjectileAttacking)                             { target.applyKnockback(hitVector.x, hitVector.z, Math.sqrt(0.9*damage), 0.1); }
    }
    projectile.remove();
});

world.afterEvents.projectileHitBlock.subscribe(async (eventData) => {
    const projectile = eventData.projectile;
    if(projectile.typeId === armorAttributes[getArmorIndex("nexus_armor")].ability1.projectile) { projectile.remove(); return; }
});


export function nexusBowStopAbility(player) {
    system.run(() => {
        player.removeEffect(EffectTypes.get('slowness'));
        player.removeEffect(EffectTypes.get('speed'));
    });
}
//--------------

//for the nexus armor --------------
world.afterEvents.entityLoad.subscribe(async (eventData) => {
    const entity = eventData.entity;
    if(entity.typeId !== "yes:nexus_projectile") { return; }
    entity.remove();
});

export function nexusProjectileTargeting(player, projectile, target, rot, playerLoc, targetLoc, distance, maxTick) {
    if(!projectile.isValid()) { return; }
    const projectileLoc = projectile.getHeadLocation();
    const ticks = projectile.getProperty("property:ticks");
    const xRand = projectile.getProperty("property:x_random");
    const yRand = projectile.getProperty("property:y_random");
    //console.warn(`${xRand} ${yRand}`);
    let time = (2/45)*Math.pow(ticks,2);                     //NaN
    if(ticks >= maxTick) {
        time = distance;
    }

    let xDir;                     //NaN
    if(time <= xRand) {
        const a1 = -(yRand/(-time*distance+2*time*xRand-Math.pow(xRand,2)));
        xDir = projFunction1(a1, time, xRand, yRand);
    }
    else { 
        const a2 = (yRand/(-Math.pow(xRand,2)-Math.pow(distance,2)+2*xRand*distance));
        xDir = projFunction2(a2, time, xRand, yRand);  
    }
    const yDir = (targetLoc.y-playerLoc.y)/distance;  //Fine

    const vector2 = Math.sqrt(xDir*xDir+time*time);                     //NaN
    const vector3 = Math.sqrt(xDir*xDir+time*time+yDir*yDir);           //NaN
    const iThetaX = Math.atan(xDir/time);                                //NaN
    const iThetaY = Math.atan(yDir/vector2);                             //NaN
    const deltaX = targetLoc.z-playerLoc.z;  //Fine
    const deltaY = targetLoc.x-playerLoc.x;  //Fine
    let thetaX;  //Fine
    if     (deltaX < 0 && deltaY > 0) { thetaX = Math.atan(deltaY/deltaX)+Math.PI; }
    else if(deltaX < 0 && deltaY < 0) { thetaX = Math.atan(deltaY/deltaX)-Math.PI; }
    else                              { thetaX = Math.atan(deltaY/deltaX)          }
    const deltaR = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
    const deltaZ = targetLoc.y-playerLoc.y;  //Fine
    const thetaY = Math.atan(deltaZ/deltaR);  //Fine
    const xRotation = roundToZero(iThetaX+thetaX);               //NaN
    const sineX = roundToZero(Math.sin(xRotation));              //NaN
    const cosineX = roundToZero(Math.cos(xRotation));           //NaN
    const yRotation = roundToZero(thetaY);  //Fine
    const sineY = roundToZero(Math.sin(yRotation));  //Fine
    const cosineTest = roundToZero(Math.cos(thetaY));  //Fine
    const sineTest = roundToZero(Math.sin(thetaY));
    
    const faceX = playerLoc.x+(vector2*sineX*cosineTest);
    const faceY = playerLoc.y+(vector3*sineY);
    const faceZ = playerLoc.z+(vector2*cosineX*cosineTest);
    //console.warn(`1:${projectile} 2:${rot} 3:${playerLoc} 4:${targetLoc} 5:${distance} 6:${maxTick} 7:${projectileLoc} 8:${ticks} 9:${xRand} 10:${yRand} 
    //    11:${time} 12:${xDir} 13:${yDir} 14:${vector2} 15:${vector3} 16:${iThetaX} 17:${iThetaY} 18:${deltaX} 19:${deltaY} 
    //    20:${thetaX} 21:${deltaR} 22:${deltaZ} 23:${thetaY} 24:${xRotation} 25:${sineX} 26:${cosineX} 27:${yRotation} 28:${sineY} 29:${cosineTest} 
    //    30:${faceX} 31:${faceY} 32:${faceZ}`);
    projectile.teleport(projectileLoc, { facingLocation: { x: faceX, y: faceY, z: faceZ } } );

    let viewVector = projectile.getViewDirection();
    const rotation = projectile.getRotation();
    if (rotation.x > 30) {
        viewVector.x *= 2.1;
        viewVector.y *= 2.1;
        viewVector.z *= 2.1;
    }
    const velo = Math.sqrt(Math.pow(faceX-projectileLoc.x,2)+Math.pow(faceY-projectileLoc.y,2)+Math.pow(faceZ-projectileLoc.z,2));
    projectile.clearVelocity();
    projectile.applyImpulse(new Vector.constructor(viewVector.x*velo, viewVector.y*velo, viewVector.z*velo));
    projectile.setRotation({ x: -rot.x, y: -rot.y});
    if(ticks < maxTick) {
        projectile.setProperty("property:ticks", ticks+1);
    }
}


function roundToZero(n) {
    if(Math.abs(n) < 0.0001) {
        return 0;
    }
    return n;
}
//x = time
//h = xRand
//k = yRand
/** projFunction1 models the projectile's location going outwards and away from the player */
function projFunction1(a1, x, h, k) {
    return -a1*Math.pow(x-h,2)+k;
}

//x = time
//h = xRand
//k = yRand
/** projFunction2 models the projectile's location going inwards toward the target */
function projFunction2(a2, x, h, k) {
    return a2*Math.pow(x-h,2)+k;
}
//--------------