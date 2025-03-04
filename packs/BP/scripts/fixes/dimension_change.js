import { system, world } from "@minecraft/server";
import * as sysVar from "../system_variables";

world.afterEvents.playerDimensionChange.subscribe((eventData) => {
    const player = eventData.player;
    sysVar.setSystemVariableValue(player, "dimensionLoaded", true);
    sysVar.setSystemVariableValue(player, "dimension", player.dimension);
});
//()
