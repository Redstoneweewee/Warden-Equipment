import { world } from '@minecraft/server';

const scoreboardList = [
    "identifier", //system scoreboards
    "owning_identifier",
    "nexus_hit_identifier",
    "xp_n",
    "exp",
    "rot_y",
    "weapon_charge",
    "ability_cooldown",
    "weapon_sound",

    "copper_oxidization", //equipment scoreboards
    "whip_animation",
    "phantom_invisibility",
    "scythe_timer",
    "reaper_timer",
    "user_reaper_timer",
    
    "mobhammer",
    "mobspear",
    "mobbattleaxe",
    "mobstaff",
    "reaper_skeleton_speed", //entity scoreboards
    "reaper_skeleton",
    "reaper_proj"
]

//initializes all scoreboards 
scoreboardList.forEach(e => {
    if(!world.scoreboard.getObjective(e)?.isValid()??0) {
        world.scoreboard.addObjective(e, e); 
        console.warn(`scoreboard: [${e}] added`);
    }
});

export { scoreboardList };