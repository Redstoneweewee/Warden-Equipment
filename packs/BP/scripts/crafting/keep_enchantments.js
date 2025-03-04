import { system, world } from "@minecraft/server";
/**
 * List of enchanted items in a player's container (inventory, not including armor slots, cursor slot, & offhan slot)
 * @example
 * enchantedItems = [
 *      {
 *          playerId: 123456789,
 *          enchantedItems: [ 
 *              Itemstack object //ex. iron sword with sharpness III
 *              Itemstack object //ex. copper helmet with protection I
 *          ]
 *      },
 *      {
 *          playerId: 987654321,
 *          enchantedItems: [
 *          ]
 *      }
 * ]
 */
var enchantedItems = [];

export function craftingKeepEnchantments(player) {
    const container = player.getComponent("minecraft:inventory").container;
    for(let i=0; i<container.size; i++) {
        const itemStack = container.getItem(i);
        const enchanted = itemStack ? (itemStack.getComponent("minecraft:enchantable")?.getEnchantments()?.length > 0 ?? false) : false;
        if(enchanted) {
            const enchants = itemStack.getComponent("minecraft:enchantable").getEnchantments();
            for(let j in enchantedItems) {
                if(enchantedItems[j].playerId === player.id) {
                    for(let k in enchantedItems[j].enchantedItems) {
                        const item = enchantedItems[j].enchantedItems[k];
                        let isSame = true;
                        for(let a in enchants) {
                            if(!item.getComponent("minecraft:enchantable").hasEnchantment(enchants[a].type) || item.typeId !== itemStack.typeId) {
                                isSame = false;
                                break;
                            }
                        }
                        if(isSame) {
                            break;
                        }
                        if(k == enchantedItems[j].enchantedItems.length-1) {
                            console.warn(`1added ${j} ${k}`)
                            enchantedItems[j].enchantedItems.push(itemStack);
                        }
                    }
                    if(enchantedItems[j].enchantedItems.length === 0) {
                        enchantedItems[j].enchantedItems.push(itemStack);
                    }
                    break;
                }
            }
        }
    }
    //console.warn(enchantedItems[0].enchantedItems);
    //console.warn(`player ${player.name} has an enchanted ${itemStack.typeId} in slot ${i+1}`);
}

/*
system.runInterval(() => {
    enchantedItems.forEach(obj => {
        const playerId = obj.playerId;
        obj.enchantedItems.forEach(e => {
            let enchantList = [];
            const enchants = e.getComponent("minecraft:enchantable").getEnchantments();
            enchants.forEach(enchant => {
                enchantList.push(`type: ${enchant.type.id}, level: ${enchant.level}`);
            });
            console.warn(`player ${playerId} has an enchanted ${e.typeId} with enchants: ${enchantList}`);
        });
    });
    //console.warn(enchantedItems[0].enchantedItems.length)
}, 5);
*/

export function addPlayerEnchantedItems(player) {
    enchantedItems.push(
        {
            playerId: player.id,
            enchantedItems: []
        }
    );
}

export function removePlayerEnchantedItems(player) {
    for(let i in enchantedItems) {
        if(enchantedItems[i].playerId === player.id) {
            enchantedItems.splice(i,1);
            break;
        }
    }
}
