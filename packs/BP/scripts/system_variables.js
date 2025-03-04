import { system } from "@minecraft/server";

var systemVariables = [];

function addSystemVariables(player) {
    systemVariables.push(
        {
            entityId: player.id,
            entityName: player.name ?? player.typeId,
            variables: [
                {
                    name: "dimensionLoaded",
                    value: true
                },
                {
                    name: "dimension",
                    value: player.dimension
                }
            ]
        }
    );
}

function removeSystemVariables(player) {
    for(let i=systemVariables.length-1; i>=0; i--) {
        if(systemVariables[i].entityId === player.id) {
            systemVariables.splice(i, 1);
            break;
        }
    }
}

function getSystemVariableValue(player, name) {
    for(let i in systemVariables) {
        if(systemVariables[i].entityId === player.id) {
            for(let j in systemVariables[i].variables) {
                if(systemVariables[i].variables[j].name === name) {
                    return systemVariables[i].variables[j].value;
                }
            }
        }
    }
}

function setSystemVariableValue(player, name, value) {
    for(let i in systemVariables) {
        if(systemVariables[i].entityId === player.id) {
            for(let j in systemVariables[i].variables) {
                if(systemVariables[i].variables[j].name === name) {
                    systemVariables[i].variables[j].value = value;
                    break;
                }
            }
        }
    }
}

export { systemVariables, addSystemVariables, removeSystemVariables, getSystemVariableValue, setSystemVariableValue };


//system.runInterval(() => {
//    for(let i in systemVariables) {
//        for(let j in systemVariables[i].variables) {
//            if(systemVariables[i].variables[j].name === "dimension") {
//                console.warn(`player ${systemVariables[i].entityName}: [var: ${systemVariables[i].variables[j].name}, value: ${systemVariables[i].variables[j].value.id}]`);
//            }
//            else {
//                console.warn(`player ${systemVariables[i].entityName}: [var: ${systemVariables[i].variables[j].name}, value: ${systemVariables[i].variables[j].value}]`);
//            }
//        }
//    }
//    console.warn(systemVariables.length);
//});