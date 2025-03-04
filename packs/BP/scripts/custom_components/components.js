import { functions } from "./functions.js";
//if(names.length !== functions.length) {
//    console.warn(`Custom Components error: names[] length is ${names.length} while functions[] length is ${functions.length}.`);
//}
export const customComponents = [
    {
        type: "item",
        name: "yes:mining_durability_damage",
        itemCustomComponent: { onMineBlock: e => { functions.miningDurabilityDamage(e); } }
    },
    {
        type: "item",
        name: "yes:on_use",
        itemCustomComponent: { onUse: e => { functions.onUse(e); } }
    },
    {
        type: "item",
        name: "yes:on_hit",
        itemCustomComponent: { onHitEntity: e => { functions.onHit(e); } }
    },
    {
        type: "item",
        name: "yes:hit_durability_damage",
        itemCustomComponent: { onBeforeDurabilityDamage: e => { functions.hitDurabilityDamage(e); } }
    },
    //{
    //    type: "block",
    //    name: "yes:drop_loot",
    //    blockCustomComponent: { onPlayerDestroy: e => { functions.onPlayerDestroy(e); } }
    //}
]; 