import { world } from '@minecraft/server';
import { removeCustomEntity } from './basic_functions';

world.afterEvents.dataDrivenEntityTrigger.subscribe(async (eventData) => {
    const eventId = eventData.eventId;
    if(eventId != "yes:despawn") { return; }
    const entity = eventData.entity;
    removeCustomEntity(entity);
});