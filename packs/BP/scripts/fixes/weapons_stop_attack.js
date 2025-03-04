//not quite possible just yet

/*
import { world, system } from '@minecraft/server';
import { getTagName } from "./basic_functions.js";

world.afterEvents.entityHitEntity.subscribe(async (eventData) => {
    const attacker = eventData.damagingEntity;
    const itemStack = attacker.getComponent('minecraft:inventory').container.getSlot(attacker.selectedSlotIndex).getItem();
});
*/