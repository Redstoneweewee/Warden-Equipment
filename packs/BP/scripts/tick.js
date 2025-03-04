import { world, system, ItemStack, EffectTypes } from '@minecraft/server';
import { getEntities, removeCustomEntity, setIdentifier, setOwningIdentifier, spawnCustomEntity, getScore } from './basic_functions';
import { armorAttributes, getArmorIndex } from './equipment_attributes/armor';

var runTime = 0;
const tickLoop = system.runInterval(() => {
    runTime++;
    despawnCustomEntities();
    tpCustomEntities();
    reaperArmorEffect();
    scytheTarget();
    //scytheCooldown();
    //console.warn("has tag: "+world.getDimension("overworld").runCommand(`testfor @e[type=husk,tag=scythe_ability_target]`).successCount);
}, 0);

export { runTime };

function tpCustomEntities() {
    const locationEntities = getEntities(undefined, ["tp_to_owner_location"]);
    locationEntities.forEach(entity => {
        const owningIdentifier = world.scoreboard.getObjective("owning_identifier").getScore(entity);
        const owner = entity.dimension.getEntities({scoreOptions:[{ objective: "identifier", minScore: owningIdentifier, maxScore: owningIdentifier}]})[0];
        if(owner === undefined || !owner.isValid()) { return; }
        const location = owner.location;
        entity.teleport(location, {dimension: owner.dimension});
    });
    const headLocationEntities = getEntities(undefined, ["tp_to_owner_head_location"]);
    headLocationEntities.forEach(entity => {
        const owningIdentifier = world.scoreboard.getObjective("owning_identifier").getScore(entity);
        const owner = entity.dimension.getEntities({scoreOptions:[{ objective: "identifier", minScore: owningIdentifier, maxScore: owningIdentifier}]})[0];
        if(owner === undefined || !owner.isValid()) { return; }
        const location = owner.getHeadLocation();
        entity.teleport(location, {dimension: owner.dimension});
    });
    const aboveHeadLocationEntities = getEntities(undefined, ["tp_to_above_owner_head_location"]);
    aboveHeadLocationEntities.forEach(entity => {
        const owningIdentifier = world.scoreboard.getObjective("owning_identifier").getScore(entity);
        const owner = entity.dimension.getEntities({scoreOptions:[{ objective: "identifier", minScore: owningIdentifier, maxScore: owningIdentifier}]})[0];
        if(owner === undefined || !owner.isValid()) { return; }
        const location = owner.getHeadLocation();
        entity.teleport({x:location.x, y:location.y+1.5, z:location.z}, {dimension: owner.dimension});
    });
}

function despawnCustomEntities() {
    const locationEntities = getEntities(undefined, ["despawn_on_owner_death"]);
    locationEntities.forEach(entity => {
        const owningIdentifier = world.scoreboard.getObjective("owning_identifier").getScore(entity);
        const owner = entity.dimension.getEntities({scoreOptions:[{ objective: "identifier", minScore: owningIdentifier, maxScore: owningIdentifier}]})[0];
        if(owner === undefined || !owner.isValid()) { removeCustomEntity(entity); }
    });
}

function scytheTarget() {
    const entities = getEntities(undefined, undefined, "scythe_timer", 1, 99999);
    entities.forEach(entity => {
        world.scoreboard.getObjective("scythe_timer").addScore(entity, -1);
        if(getScore(entity, "scythe_timer") <= 0 && (getScore(entity, "reaper_timer") === undefined || getScore(entity, "reaper_timer") <= 0)) {
            entity.removeTag(`yes:scythe_ability_target`);
            setIdentifier(entity);
            const identifier = getScore(entity, "identifier");
            const particleEntities = entity.dimension.getEntities({ type: "yes:reaper_aura_particle_entity", scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]});
            particleEntities.forEach(particleEntity => {
                if(particleEntity !== undefined) { removeCustomEntity(particleEntity); }
            });
        }
    });
}

function reaperArmorEffect() {
    const index = getArmorIndex("reaper_armor");
    const entities = getEntities(undefined, undefined, "reaper_timer", 1, 99999);
    entities.forEach(target => {
        const score = getScore(target, "reaper_timer");
        if(armorAttributes[index].ability1.active) {
            armorAttributes[index].ability1.levels.forEach(obj => {
                if(score >= obj.score && obj.affects === "target") { target.addEffect(EffectTypes.get(obj.effect.effect), obj.effect.duration, { amplifier: obj.effect.level-1, showParticles: obj.effect.showParticles }); }
            });
        }
        if(armorAttributes[index].ability1.fog.active) {
            if(score >= armorAttributes[index].ability1.fog.score && !target.hasTag("yes:has_reaper_fog")) { 
                target.runCommandAsync(`fog @s push ${armorAttributes[index].ability1.fog.fog} ${armorAttributes[index].ability1.fog.name.target}`); 
                target.addTag("yes:has_reaper_fog");
            }
            else if(score < armorAttributes[index].ability1.fog.score && target.hasTag("yes:has_reaper_fog")) {
                target.runCommandAsync(`fog @s remove ${armorAttributes[index].ability1.fog.name.target}`); 
                target.removeTag("yes:has_reaper_fog");
            }
        }
        if(armorAttributes[index].ability2.active) {
            if(score >= armorAttributes[index].ability2.score && !target.hasTag("yes:scythe_ability_target")) {
                const particleEntity = spawnCustomEntity(armorAttributes[index].ability2.particleEntity, target);
                particleEntity.teleport(target.getHeadLocation());
                setOwningIdentifier(particleEntity, target);
                target.addTag("yes:scythe_ability_target");
            }
        }
        world.scoreboard.getObjective("reaper_timer").addScore(target, -1);
        if(getScore(target, "reaper_timer") <= 0 && (getScore(target, "scythe_timer") === undefined || getScore(target, "scythe_timer") <= 0)) {
            target.removeTag(`yes:scythe_ability_target`);
            setIdentifier(target);
            const identifier = getScore(target, "identifier");
            const particleEntities = target.dimension.getEntities({ type: "yes:reaper_aura_particle_entity", scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]});
            particleEntities.forEach(particleEntity => {
                if(particleEntity !== undefined) { removeCustomEntity(particleEntity); }
            });
        }
    });
}