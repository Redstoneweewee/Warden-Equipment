import { world, system } from "@minecraft/server";
import { getItemName, getItemType } from "../basic_functions";
import { weaponAttributes } from "../equipment_attributes/weapons";

export function possibleCustomDeathMessage(target, itemStack, player) {
    world.gameRules.showDeathMessages = false;
    system.run(() => {
        const health = target.getComponent("minecraft:health").currentValue;
        if(health <= 0) {
            const itemType = getItemType(itemStack);
            const itemName = getItemName(itemStack);
            let itemNameArr = itemName.split(":")[1].split("_");
            for(let i in itemNameArr) {
                itemNameArr[i] = itemNameArr[i].charAt(0).toUpperCase() + itemNameArr[i].slice(1);
            }
            const itemNameActual = itemNameArr.join(" ");
            const firstLetter = itemNameActual.charAt(0);
            for(let i in weaponAttributes) {
                if(weaponAttributes[i].type === itemType) {
                    if(firstLetter === "A" || firstLetter === "E" || firstLetter === "I" || firstLetter === "O" || firstLetter === "U") {
                        world.sendMessage(`${target.name} was ${weaponAttributes[i].attackName} by ${player.name} with an ${itemNameActual}`);
                    }
                    else {
                        world.sendMessage(`${target.name} was ${weaponAttributes[i].attackName} by ${player.name} with a ${itemNameActual}`);
                    }
                }
            }
        }
        world.gameRules.showDeathMessages = true;
    });
}