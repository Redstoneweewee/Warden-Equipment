import { world } from "@minecraft/server";
import { isCreative } from "../basic_functions";

export function headRotationLinkFunction(player, identifier) {
    const playerEntity = player.dimension.getEntities({type:"yes:player_entity", scoreOptions:[{objective: "owning_identifier", maxScore: identifier, minScore: identifier}]})[0];
    if(playerEntity !== undefined) {
        const oldRotY = (playerEntity.getRotation().y*(32/45)-1);
        let rotY = 0;
        if(isCreative(player)) { rotY += Math.pow(2,0); }
        if(oldRotY !== rotY) {
            world.scoreboard.getObjective("rot_y").setScore(player, rotY);
            setRotationY(playerEntity, rotY);
            player.applyKnockback(-player.getViewDirection().x, -player.getViewDirection().z, 0.005, 0);
        }
    }
}

function setRotationY(entity, yRot) {
    var newYRot = ((yRot+1)*45/32);
    var xRot = entity.getRotation().x;
    entity.setRotation({x:xRot, y:newYRot});
    //entity.runCommand(`tp @s ~~~ ~ ${newYRot}`);
    //entity.runCommand(`ride @s start_riding @a[r=3.7,c=1,scores={identifier=${identifier}}]`);
    //entity.applyKnockback(0, 0, 1, 0);
    console.warn("rotation set for "+entity.typeId+": (x:"+xRot+", y:"+newYRot+")");
}
