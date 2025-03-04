import { getItemType } from "../basic_functions";
//armor special ability attributes

export const armorAttributes = [
    {
        type: "copper_armor",
        ability1: {
            active: true,
            ticksPerCheck: 1200,
            minScore: 5, //starts to oxidize at 5 loops
            maxScore: 20, //guaranteed to oxidize at 20 loops
            chance: 0.1
        }
    },
    {
        type: "phantom_armor",
        ability1: {
            active: true,
            effect: "invisibility",
            level: 1,
            showParticles: false,
            threshold: {
                min: 50, //gets invis at 50 but shows flashing invis icon
                mid: 110, //no more flashin icon
                max: 200 //maximum score
            },
            gainPerTick: 1,
            lossPerTick: 3,
            particle1: "yes:phantom_landing_cloud",
            particle2: "yes:phantom_particle"
        },
        ability2: {
            active: true,
            effect: "slow_falling",
            level: 1,
            showParticles: true,
            duration: 10
        }
    },
    {
        type: "glowing_obsidian_armor",
        ability1: {
            active: true,
            effect: "strength",
            level: 1,
            showParticles: false,
            ticksPerCheck: 30,
            enemiesRange: 10,
            alliesRange: 8,
            threshold: {
                min: 1, //min number of mobs to activate ability (with 1/2 up-time, scales dynamically as number increases)
                max: 5 //max number of mobs to activate ability (with 100% up-time)
            },
            sound: "block.false_permissions",
            soundRange: 20,
            minPitch: 0.046,
            maxPitch: 0.048,
            particle: "yes:glowing_obsidian_particle"
        },
        ability2: {
            active: true,
            placeBlock: "minecraft:light_block",
            lightLevel: 15
        }
    },
    {
        type: "nexus_armor",
        ability1: {
            active: true,
            projectile: "yes:nexus_projectile",
            maxProjectiles: 7,
            ticksPerCheck: 3,
            summonTime: 20,
            normal: {
                radius: 0.8,
                height: 0.9, //additive to a sin wave
                spawnHeight: 0.9 //additive to the player's y-location
            },
            sneaking: {
                radius: 2,
                height: 0,
                spawnHeight: 0.75 //additive to the player's y-location
            },
            range: 100,
            projectileDelay: 3, //time it takes for the next nexus projectile to start attacking a target
            damage: 5 //this only applies to when the projectiles are floating around you.
                      //The damage for when they fly toward a target is located in the nexus_bow attributes.
        }
    },
    {
        type: "warden_armor",
        initialEquip: {
            active: true,
            effect: "darkness",
            level: 1,
            duration: 202,
            totalBlindness: {
                active: true,
                holdTime: 30,
                fadeTime: 40
            },
            sounds: [
                {
                    sound: "mob.warden.agitated.weewee",
                    volume: 0.9,
                    pitch: 0.4
                },
                {
                    sound: "mob.warden.shriek_weewee",
                    volume: 1,
                    pitch: 0.3
                },
                {
                    sound: "mob.warden.heartbeat.weewee",
                    volume: 1,
                    pitch: 1
                }
            ],
            heartbeatInterval: 35
        },
        ability1: {
            active: true,
            ticksPerCheck: 100,
            range: 25,
            entity1: "yes:warden_ping_humanoid",
            entity2: "yes:warden_ping_other",
            sound: "power.on.sculk_sensor"
        },
        ability2: {
            active: true,
            effect: "night_vision",
            level: 1,
            showParticles: false,
            ticksPerCheck: 2,
            resistEffects: [
                "blindness",
                "darkness"
            ]
        }
    },
    {
        type: "aetherite_armor",
        ability1: {
            active: true,
            effect: "regeneration",
            level: 1,
            showParticles: {
                self: false,
                other: true
            },
            duration: 70,
            ticksPerCheck: 60,
            range: 20
        },
        ability2: {
            active: true,
            effect: "health_boost",
            level: 2,
            showParticles: false
        }
    },
    {
        type: "gilded_netherite_armor",
        ability1: {
            active: true,
            effect: "resistance",
            level: 1,
            showParticles: false
        },
        ability2: {
            knockbackResistance: true
        }
    },
    {
        type: "reaper_armor",
        initialEquip: {
            active: true,
            duration: 38,
            knockback: {
                horizontalKnockback: 3,
                verticalKnockback: 0.4,
                range: 12
            },
            fog: "yes:reaper_fog_wearer_initial",
            name: "reaper_wearer_initial",
            particleEntity: "yes:reaper_armor_activate_particle_entity",
            sound: "armor.reaper_initial_weewee",
            soundRange: 20,
            camerashake: [
                {
                    level: 1,
                    intensity: 0.008,
                    duration: 40,
                    score: {
                        min: 28,
                        max: 38
                    }
                },
                {
                    level: 2,
                    intensity: 0.02,
                    duration: 100,
                    score: {
                        min: 38,
                        max: 38
                    }
                },
                {
                    level: 3,
                    intensity: 0.05,
                    duration: 40,
                    score: {
                        min: 38,
                        max: 38
                    }
                }
            ]
        },
        ability1: {
            active: true,
            range: 50,
            ticksPerCheck: 1,
            levels: [
                {
                    level: 1,
                    score: 20, //only activates if score is 20 or higher
                    affects: "target",
                    effect: {
                        effect: "weakness",
                        showParticles: true,
                        level: 1,
                        duration: 20
                    }
                },
                {
                    level: 2,
                    score: 40,
                    affects: "target",
                    effect: {
                        effect: "slowness",
                        showParticles: true,
                        level: 1,
                        duration: 20
                    }
                },
                {
                    level: 3,
                    score: 60,
                    affects: "self",
                    effect: {
                        effect: "speed",
                        showParticles: false,
                        level: 1,
                        duration: 100
                    }
                },
                {
                    level: 4,
                    score: 80,
                    affects: "target",
                    effect: {
                        effect: "weakness",
                        showParticles: true,
                        level: 2,
                        duration: 20
                    }
                }
            ],
            fog: {
                active: true,
                fog: "yes:reaper_fog_target",
                name: {
                    target: "reaper_target",
                    self: "reaper_user"
                },
                score: 40 //adds fog to user and target at score 40
            },
        },
        ability2: {
            active: true,
            particleEntity: "yes:reaper_aura_particle_entity",
            score: 40 //adds fog to user and target at score 40
        }
    }
]


/**
 * Returns the armorAttributes index of an armor.
 * @param {String} type - The type of the armor. For example, `copper_armor` or `glowing_obsidian_armor`.
 * @returns {number} Returns the armorAttributes index of the armor.
 */
function getArmorIndex(type) {
    for(var i=0; i<armorAttributes.length; i++) {
        if(armorAttributes[i].type === type) { return i; }
    }
}

export { getArmorIndex };
