import { world, system } from "@minecraft/server";
import { getAllEquipment, getArmorType, getItemType } from "../basic_functions";
import { weaponAttributes, getWeaponIndex } from "../equipment_attributes/weapons";
import { armorAttributes, getArmorIndex } from "../equipment_attributes/armor";

world.afterEvents.entityHurt.subscribe(async (eventData) => {
    const entity = eventData.hurtEntity;
    if(entity.typeId !== "minecraft:player") { return; }
    if(!armorAttributes[getArmorIndex("gilded_netherite_armor")].ability2.knockbackResistance) { return; }
    const equipment = getAllEquipment(entity);
    for(let i=0; i<4; i++) {
        if(getArmorType(equipment[i].item) !== "gilded_netherite_armor") { return; }
        if(i === 3) {
            const attacker       = eventData.damageSource.damagingEntity ?? undefined;
            const attackerWeapon = attacker ? getAllEquipment(attacker)[4].item : undefined;
            const weaponType     = attackerWeapon ? getItemType(attackerWeapon) : undefined;
            const index          = weaponType ? getWeaponIndex(weaponType) : undefined;
            const trueKnockback  = index ? weaponAttributes[index].ability.trueKnockback : undefined;

            if(attacker === undefined || attackerWeapon === undefined || !trueKnockback) {
                entity.teleport(entity.location, {rotation: entity.getRotation()});
            }
        }
    }
});