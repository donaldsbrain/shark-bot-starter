import { DevClient } from "../clients/dev";
import { PlayerClient } from "../clients/player";
import { getAngleDifference, getAngleToPoint } from "../domain/spacial";
import { ArenaSettings, BeatUpdate, DeadBeatUpdate } from "../dto";

export function startBot2(client: PlayerClient, devClient: DevClient) {
    
    client
        .updates()
        .subscribe(update => handleUpdates(client, update, devClient))
}

function handleUpdates(
    client: PlayerClient, 
    {settings, update}: {settings:ArenaSettings, update: BeatUpdate | DeadBeatUpdate},
    devClient: DevClient) {
    if (update.gameTime === 10) {
        
    }
    if (update.isAlive === 'yes' && update.gameTime > -1) {        
        aliveUpdate(update);
    } else {
        deadUpdate(update);
    }

    function aliveUpdate(update: BeatUpdate) {
        const spiralSteps = 96;
        const mod = update.gameTime % spiralSteps;        
        if (mod === 0) {
            devClient.positionShark({
                sharkId: update.sharkId,
                centerPoint: {x:30,y:300},
                facingAngle: Math.PI / 2
            })
        }
        if (mod >= 1 && mod < 13) {
            client.fireTorpedo(update.facing);
        }
        if (mod === 14) {
            devClient.positionShark({
                sharkId: update.sharkId,
                centerPoint: {x:770,y:300},
                facingAngle: -Math.PI / 2
            })
        }
        if (mod === 38) {
            client
                .fireLaser();
        }        
    }

    function deadUpdate(deadUpdate: DeadBeatUpdate | BeatUpdate) {
        if (deadUpdate.gameTime % 18 === 0) {
            client
                .takeControl();
        }
    }
}