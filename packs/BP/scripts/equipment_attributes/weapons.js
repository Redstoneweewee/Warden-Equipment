import { getItemType } from "../basic_functions";
//weapon special ability attributes

export const weaponAttributes = [
    {
        type: "hammer",
        attackName: "smashed",
        ability: {
            abilityDamage: {
                woodenTier: 3,
                stoneTier: 4,
                ironTier: 5, //<-- copper hammers
                diamondTier: 6, //<-- oxidized copper hammers
                netheriteTier: 7,
                alloyTier: 8
            },
            range: 4.5,
            windupTime: 20, //in ticks
            durabilityDamage: 1
        },
        abilityDamageEnchant: [
            {
                level: 1,
                /** Can be `abilityDamage`, `abilityEffectDuration`, `hitDamage`, `hitEffectDuration`, or `all`.*/
                appliesTo: "abilityDamage",
                /** each level's `add` stacks with the previous level(s).*/
                add: 1
            },
            {
                level: 2,
                appliesTo: "abilityDamage",
                add: 1
            },
            {
                level: 3,
                appliesTo: "abilityDamage",
                add: 1
            }
        ],
        soundRange: 35,
        attackSound: "weapon.hammer_weewee",
        hitSound: "weapon.hammer_hit_weewee",
        animation: "animation.player.hammer1",
        animationDuration: 55,
        particle: "none"
    },
    {
        type: "spear",
        attackName: "stabbed",
        ability: {
            abilityDamage: {
                woodenTier: 10,
                stoneTier: 13,
                ironTier: 17,
                diamondTier: 20, //<-- amethyst spear
                netheriteTier: 23,
                alloyTier: 26
            },
            range: 5,
            windupTime: 13, 
            durabilityDamage: 4
        },
        abilityDamageEnchant: [
            {
                level: 1,
                appliesTo: "abilityDamage",
                add: 2
            },
            {
                level: 2,
                appliesTo: "abilityDamage",
                add: 2
            },
            {
                level: 3,
                appliesTo: "abilityDamage",
                add: 2
            }
        ],
        soundRange: 25,
        attackSound: "weapon.spear_weewee",
        hitSound: "weapon.spear_hit_weewee",
        animation: "animation.player.stab2",
        animationDuration: 30,
        particle: "yes:spear_particle"
    },
    {
        type: "dagger",
        attackName: "shanked",
        ability: { //in the dagger's case, its ability is a critical left-click hit, not a right-click ability.
            effectDuration: { //each 12 ticks is 1 poison damage, but first 12 don't do anything. So dmg = 12 + dmg*12
                woodenTier: 48,
                stoneTier: 48,
                ironTier: 60,
                diamondTier: 84, //<-- emerald dagger
                netheriteTier: 108,
                alloyTier: 120
            }
        },
        hitAbility: {
            effectDuration: { //each 12 ticks is 1 poison damage, but first 12 don't do anything. So dmg = 12 + dmg*12
                woodenTier: 24,
                stoneTier: 36,
                ironTier: 36,
                diamondTier: 48, //<-- emerald dagger
                netheriteTier: 60,
                alloyTier: 60
            }
        },
        abilityDamageEnchant: [
            {
                level: 1,
                appliesTo: "abilityEffectDuration",
                add: 12
            },
            {
                level: 2,
                appliesTo: "hitEffectDuration",
                add: 12
            },
            {
                level: 3,
                appliesTo: "abilityEffectDuration",
                add: 12
            }
        ],
        soundRange: 25,
        hitSound: "weapon.dagger_hit_weewee"
    },
    {
        type: "whip",
        attackName: "whipped",
        ability: {
            abilityDamage: {
                woodenTier: 3,
                stoneTier: 4,
                ironTier: 6,
                diamondTier: 7, //<-- phantom whip
                netheriteTier: 8,
                alloyTier: 9
            },
            range: 10,
            windupTime: 15,
            durabilityDamage: 1,
            horizontalKnockback: 1.7,
            verticalKnockback: 0.7,
            trueKnockback: true
        },
        abilityDamageEnchant: [
            {
                level: 1,
                appliesTo: "abilityDamage",
                add: 1
            },
            {
                level: 2,
                appliesTo: "abilityDamage",
                add: 1
            },
            {
                level: 3,
                appliesTo: "abilityDamage",
                add: 1
            }
        ],
        animationStates: [
            { state: 2, time: 4 },
            { state: 3, time: 6 },
            { state: 4, time: 8 },
            { state: 5, time: 9 },
            { state: 6, time: 11 },
            { state: 7, time: 16 },
            { state: 6, time: 19 },
            { state: 5, time: 20 },
            { state: 4, time: 21 },
            { state: 2, time: 22 },
            { state: 1, time: 23 }
        ],
        soundRange: 50,
        attackSound: "weapon.whip_weewee",
        hitSound: "weapon.whip_hit_weewee",
        animation: "animation.whip_attack",
        animationDuration: 27,
        particle: "minecraft:basic_crit_particle"
    },
    {
        type: "battleaxe",
        attackName: "cleaved",
        ability: {
            abilityDamage: {
                woodenTier: 6,
                stoneTier: 9,
                ironTier: 12,
                diamondTier: 14, //<-- glowing_obsidian_battleaxe
                netheriteTier: 16,
                alloyTier: 18
            },
            range: 4.5,
            windupTime: 36,
            durabilityDamage: 2,
            horizontalKnockback: 0,
            verticalKnockback: 0.4,
            effect: {
                active: true,
                effect: "speed",
                level: 1,
                showParticles: false,
                duration: 36
            }
        },
        abilityDamageEnchant: [
            {
                level: 1,
                appliesTo: "abilityDamage",
                add: 2
            },
            {
                level: 2,
                appliesTo: "abilityDamage",
                add: 2
            },
            {
                level: 3,
                appliesTo: "abilityDamage",
                add: 2
            }
        ],
        soundRange: 35,
        attackSound: "weapon.battleaxe_weewee",
        hitSound: "weapon.battleaxe_hit_weewee",
        animation: "animation.battleaxe_attack1",
        animationDuration: 58,
        particle: "yes:battleaxe_particle"
    },
    {
        type: "greatsword",
        attackName: "slashed",
        hitAbility: {
            hitDamage: {
                woodenTier: 3,
                stoneTier: 4,
                ironTier: 4,
                diamondTier: 5, //<-- emerald greatsword
                netheriteTier: 6, //<-- aetherite greatsword
                alloyTier: 7
            },
            range: 3.8,
            cooldown: 10, //in ticks
            durabilityDamage: 1
        },
        abilityDamageEnchant: [
            {
                level: 1,
                appliesTo: "hitDamage",
                add: 1
            },
            {
                level: 2,
                appliesTo: "hitDamage",
                add: 1
            },
            {
                level: 3,
                appliesTo: "hitDamage",
                add: 1
            }
        ],
        soundRange: 35,
        attackSound: "weapon.greatsword_weewee",
        hitSound: "weapon.greatsword_hit_weewee",
        animation1: "animation.greatsword_left_swing",
        animation2: "animation.greatsword_right_swing",
        animation3: "animation.greatsword_left_swing_connected",
        animationDuration: 31,
        particle1: "yes:greatsword_left_particle",
        particle2: "yes:greatsword_right_particle"
    },
    {
        type: "morningstar",
        attackName: "bashed",
        ability: {
            abilityDamage: {
                woodenTier: 3,
                stoneTier: 4,
                ironTier: 4,
                diamondTier: 5, //<-- diamond mace
                netheriteTier: 6, //<-- netherite mace
                alloyTier: 7 //<-- gilded netherite mace
            },
            effectDuration: { //stuns the target for x ticks
                woodenTier: 10,
                stoneTier: 10,
                ironTier: 15,
                diamondTier: 20, //<-- diamond mace
                netheriteTier: 25, //<-- netherite mace
                alloyTier: 30 //<-- gilded netherite mace
            },
            range: 1.8,
            chargeDuration: 12,
            durabilityDamage: 1
        },
        hitAbility: {
            hitDamage: { //damages equipment durability
                woodenTier: 15,
                stoneTier: 20,
                ironTier: 30,
                diamondTier: 35, //<-- diamond mace
                netheriteTier: 40, //<-- netherite mace
                alloyTier: 45 //<-- gilded netherite mace
            }
        },
        abilityDamageEnchant: [
            {
                level: 1,
                appliesTo: "abilityEffectDuration",
                add: 5
            },
            {
                level: 2,
                appliesTo: "hitDamage",
                add: 5
            },
            {
                level: 3,
                appliesTo: "abilityEffectDuration",
                add: 5
            }
        ],
        soundRange: 35,
        attackSound: "weapon.mace_weewee",
        hitSound: "weapon.mace_hit_weewee",
        animation: "animation.player.mace",
        animationDuration: 12
    },
    {
        type: "scythe",
        attackName: "reaped",
        ability: {
            abilityDamage: { //in this case, it's a percentage of the target's health 
                woodenTier: 10,
                stoneTier: 12,
                ironTier: 16,
                diamondTier: 20, //<-- diamond scythe
                netheriteTier: 24, //<-- netherite scythe
                alloyTier: 30 //<-- reaper scythe
            },
            range: 30,
            chargeDuration: 20,
            windupTime: 10,
            cooldown: 140,
            durabilityDamage: 5
        },
        hitAbility: {
            pullStrength: 1,
            cooldown: 16
        },
        abilityDamageEnchant: [
            {
                level: 1,
                appliesTo: "abilityDamage",
                add: 3
            },
            {
                level: 2,
                appliesTo: "abilityDamage",
                add: 4
            },
            {
                level: 3,
                appliesTo: "abilityDamage",
                add: 3
            }
        ],
        soundRange: 50,
        attackSound: "weapon.scythe_ability_weewee",
        hitSound: "weapon.scythe_hit_weewee"
    },
    //{
    //    type: "katana"
    //},
    {
        type: "echo_staff",
        attackName: "blasted",
        ability: {
            abilityDamage: {  
                woodenTier: 3,
                stoneTier: 3,
                ironTier: 4,
                diamondTier: 5,
                netheriteTier: 6, //<-- echo staff
                alloyTier: 7
            },
            range: 10,
            duration: 60,
            attackInterval: 3, //3 ticks per attack
            windupTime: 13,
            durabilityDamage: 1,
            horizontalKnockback: 1.3,
            verticalKnockback: 0.3
        },
        abilityDamageEnchant: [
            {
                level: 1,
                appliesTo: "abilityDamage",
                add: 1
            },
            {
                level: 2,
                appliesTo: "abilityDamage",
                add: 1
            },
            {
                level: 3,
                appliesTo: "abilityDamage",
                add: 1
            }
        ],
        soundRange: 50,
        attackSound: "mob.warden.boom_weewee",
        animation: "animation.echo_staff_attack",
        animationDuration: 88,
    },
    {
        type: "nexus_bow",
        attackName: "shot",
        hitAbility: { //In this case, the hitAbility is the bow's arrows
            hitDamage: {
                woodenTier: 5,
                stoneTier: 7,
                ironTier: 10,
                diamondTier: 12, //<-- nexus bow, max damage
                netheriteTier: 14,
                alloyTier: 16
            },
            projectile: "yes:nexus_arrow",
            spread: 0.006,
            maxPower: 8,
            criticalMultiplier: 1.2,
            windupTime: 25,
            durabilityDamage: 1,
            horizontalKnockback: 0.6, //this is actually used as a multiplier, not an exact number
            verticalKnockback: 0.4
        },
        ability: { //In this case, the hitAbility is the bow's arrows
            abilityDamage: {
                woodenTier: 0,
                stoneTier: 0,
                ironTier: 0,
                diamondTier: 1.5, //<-- nexus projectile damage
                netheriteTier: 0,
                alloyTier: 0
            }
        },
        abilityDamageEnchant: [
            {
                level: 1,
                appliesTo: "abilityDamage",
                add: 0.1
            },
            {
                level: 2,
                appliesTo: "abilityDamage",
                add: 0.2
            },
            {
                level: 3,
                appliesTo: "abilityDamage",
                add: 0.2
            }
        ],
        soundRange: 25,
        attackSound: "random.bow"
    },
]


/**
 * Returns the weaponAttributes index of an weapon.
 * @param {String} type - The type of the item. For example, `spear` or `sword`.
 * @returns {number} Returns the weaponAttributes index of the weapon.
 */
function getWeaponIndex(type) {
    for(var i=0; i<weaponAttributes.length; i++) {
        if(weaponAttributes[i].type === type) { return i; }
    }
}


/**
 * Returns the weapon tier of an item. Can be `woodenTier`, `stoneTier`, `ironTier`, `diamondTier`, `netheriteTier`, and `alloyTier`.
 * @param {ItemStack} itemStack - The item being passed.
 * @returns {number} Returns the weapon tier of an item. If it has no tier, returns "none".
 */
function getWeaponTier(itemStack) {
    if(itemStack.hasTag("yes:wooden_tier")) { return "woodenTier"; }
    else if(itemStack.hasTag("yes:stone_tier")) { return "stoneTier"; }
    else if(itemStack.hasTag("yes:iron_tier")) { return "ironTier"; }
    else if(itemStack.hasTag("yes:diamond_tier")) { return "diamondTier"; }
    else if(itemStack.hasTag("yes:netherite_tier")) { return "netheriteTier"; }
    else if(itemStack.hasTag("yes:alloy_tier")) { return "alloyTier"; }
    else { return "none"; }
}


/**
 * Returns the weapon ability damage of an item. 
 * @param {ItemStack} itemStack - The item being passed.
 * @param {String} type - The type of damage. Currently can be `abilityDamage`, `hitDamage`, `abilityEffectDuration`, and `hitEffectDuration`. Most weapons do not have attributes for the last three types.
 * @returns {number} Returns the weapon ability damage of an item. 
 */
function getWeaponDamage(itemStack, type) {
    const weaponType = getItemType(itemStack);
    const index = getWeaponIndex(weaponType);
    const weaponTier = getWeaponTier(itemStack);
    const itemName = itemStack.typeId;
    var damage = 0;
    var abilityDamageLevel = 0;
    var abilityDamageApplyTo = "";
    if     (itemName.includes("_ad1")) { abilityDamageLevel = 1; }
    else if(itemName.includes("_ad2")) { abilityDamageLevel = 2; }
    else if(itemName.includes("_ad3")) { abilityDamageLevel = 3; }
    if(type === "abilityDamage") {
        if     (weaponTier === "woodenTier")    { damage = weaponAttributes[index].ability.abilityDamage.woodenTier; }
        else if(weaponTier === "stoneTier")     { damage = weaponAttributes[index].ability.abilityDamage.stoneTier; }
        else if(weaponTier === "ironTier")      { damage = weaponAttributes[index].ability.abilityDamage.ironTier; }
        else if(weaponTier === "diamondTier")   { damage = weaponAttributes[index].ability.abilityDamage.diamondTier; }
        else if(weaponTier === "netheriteTier") { damage = weaponAttributes[index].ability.abilityDamage.netheriteTier; }
        else if(weaponTier === "alloyTier")     { damage = weaponAttributes[index].ability.abilityDamage.alloyTier; }
        abilityDamageApplyTo = "abilityDamage";
    }
    else if(type === "hitDamage") {
        if     (weaponTier === "woodenTier")    { damage = weaponAttributes[index].hitAbility.hitDamage.woodenTier; }
        else if(weaponTier === "stoneTier")     { damage = weaponAttributes[index].hitAbility.hitDamage.stoneTier; }
        else if(weaponTier === "ironTier")      { damage = weaponAttributes[index].hitAbility.hitDamage.ironTier; }
        else if(weaponTier === "diamondTier")   { damage = weaponAttributes[index].hitAbility.hitDamage.diamondTier; }
        else if(weaponTier === "netheriteTier") { damage = weaponAttributes[index].hitAbility.hitDamage.netheriteTier; }
        else if(weaponTier === "alloyTier")     { damage = weaponAttributes[index].hitAbility.hitDamage.alloyTier; }
        abilityDamageApplyTo = "hitDamage";
    }
    else if(type === "abilityEffectDuration") {
        if     (weaponTier === "woodenTier")    { damage = weaponAttributes[index].ability.effectDuration.woodenTier; }
        else if(weaponTier === "stoneTier")     { damage = weaponAttributes[index].ability.effectDuration.stoneTier; }
        else if(weaponTier === "ironTier")      { damage = weaponAttributes[index].ability.effectDuration.ironTier; }
        else if(weaponTier === "diamondTier")   { damage = weaponAttributes[index].ability.effectDuration.diamondTier; }
        else if(weaponTier === "netheriteTier") { damage = weaponAttributes[index].ability.effectDuration.netheriteTier; }
        else if(weaponTier === "alloyTier")     { damage = weaponAttributes[index].ability.effectDuration.alloyTier; }
        abilityDamageApplyTo = "abilityEffectDuration";
    }
    else if(type === "hitEffectDuration") {
        if     (weaponTier === "woodenTier")    { damage = weaponAttributes[index].hitAbility.effectDuration.woodenTier; }
        else if(weaponTier === "stoneTier")     { damage = weaponAttributes[index].hitAbility.effectDuration.stoneTier; }
        else if(weaponTier === "ironTier")      { damage = weaponAttributes[index].hitAbility.effectDuration.ironTier; }
        else if(weaponTier === "diamondTier")   { damage = weaponAttributes[index].hitAbility.effectDuration.diamondTier; }
        else if(weaponTier === "netheriteTier") { damage = weaponAttributes[index].hitAbility.effectDuration.netheriteTier; }
        else if(weaponTier === "alloyTier")     { damage = weaponAttributes[index].hitAbility.effectDuration.alloyTier; }
        abilityDamageApplyTo = "hitEffectDuration";
    }
    weaponAttributes[index].abilityDamageEnchant.forEach(obj => {
        if((obj.appliesTo === abilityDamageApplyTo || obj.appliesTo === "all") && obj.level <= abilityDamageLevel) {
            damage += obj.add;
        }
    });
    return damage;
}

export { getWeaponIndex, getWeaponTier, getWeaponDamage };