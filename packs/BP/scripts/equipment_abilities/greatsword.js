import { world, system } from '@minecraft/server';
import { setOwningIdentifier, getScore, getEntities, spawnCustomEntity, removeCustomEntity, changeLocationFromViewDirection, getTagName } from "../basic_functions.js";

function greatswordInitialize(player) {
    player.addTag("holding:greatsword");
    const entity = spawnCustomEntity("yes:empty_hit_entity", player);
    setOwningIdentifier(entity, player);
}

function greatswordStop(player) {
    player.removeTag("holding:greatsword");
    const identifier = getScore(player, "identifier");
    const entity = player.dimension.getEntities({type: "yes:empty_hit_entity", scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]});
    entity.forEach(e => {
        removeCustomEntity(e);
    });
}  

export { greatswordInitialize, greatswordStop };

var firstEntry = false;
getEntities("yes:empty_hit_entity").forEach(entity => { cont(entity); });
world.afterEvents.playerSpawn.subscribe(async () => {
    if(!firstEntry) { getEntities("yes:empty_hit_entity").forEach(entity => { cont(entity); }); }
});
world.afterEvents.entitySpawn.subscribe(async (eventData) => {
    system.run(() => {
        if((eventData.entity?.typeId??"") !== "yes:empty_hit_entity") return;
        cont(eventData.entity);
    })
});
function cont(entity) {
    firstEntry = true;
    const owning_identifier = getScore(entity, "owning_identifier")??0;
    const owner = entity.dimension.getEntities({scoreOptions:[{objective: "identifier", maxScore: owning_identifier, minScore: owning_identifier}]})[0];
    if(owner === undefined) return;
    system.runInterval(() => {
        if(!entity.isValid()) { return; }
        if(!owner.isValid()) { entity.remove(); return; }
        
        const velo = owner.getVelocity();
        const ownerSpeed = Math.sqrt(velo.x**2 + velo.y**2 + velo.z**2);
        var tpDistance = 0;
        if(ownerSpeed > 0.3) { tpDistance = 2.4; }
        else { tpDistance = ownerSpeed*6; }
        const tpLocation = changeLocationFromViewDirection(owner, tpDistance, owner.getHeadLocation());
        entity.teleport(tpLocation, {dimension: owner.dimension});
    });
}

//world.afterEvents.entityHitEntity.subscribe( (eventData) => {
//    console.warn("hi");
//});
//world.afterEvents.entityHurt.subscribe( (eventData) => {
    //console.warn("hurt");
    ////////if(eventData.hurtEntity.typeId === "minecraft:player") { eventData.hurtEntity.runCommand(`playsound mob.hurt.weewee @a[r=16] ~~1~`); }
    //if(eventData.hurtEntity.typeId !== "yes:empty_hit_entity") return;
    //const entity = eventData.hurtEntity;
    //const damage = eventData.damage;
    //const cause = eventData.damageSource.cause;
    //const owning_identifier = getScore(entity, "owning_identifier");
    //var attacker = eventData.damageSource?.damagingEntity??undefined;
    //const owner = entity.dimension.getEntities({scoreOptions:[{objective: "identifier", maxScore: owning_identifier, minScore: owning_identifier}]})[0];
    //if(owner && owner.id !== attacker.id) {
    //    if(attacker) {
    //        owner.applyDamage(damage, {cause: cause, damagingEntity: attacker});
    //    }
    //    else {
    //        attacker = eventData.damageSource.damagingProjectile;
    //        owner.applyDamage(damage, {damagingProjectile: attacker});
    //    }
    //}
    //console.warn(`${eventData.hurtEntity.typeId} was hit for ${damage} damage by ${cause} attack type.`);
//});