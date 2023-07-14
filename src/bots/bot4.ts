import { DevClient } from "../clients/dev";
import { PlayerClient } from "../clients/player";
import { getAngleDifference, getAngleToPoint, getDistance, getNextMoveToAngle } from "../domain/spacial";
import { ArenaSettings, BeatUpdate, DeadBeatUpdate } from "../dto";

const points = [
    {x:300,y:300},
    {x:300,y:100},
    {x:300,y:500},
    {x:11,y:10}
]

export function startBot4(client: PlayerClient, devClient: DevClient) {
    
    client
        .updates()
        .subscribe(update => handleUpdates(client, update, devClient))
}

function handleUpdates(
    client: PlayerClient, 
    {settings, update}: {settings:ArenaSettings, update: BeatUpdate | DeadBeatUpdate},
    devClient: DevClient) {

    if (update.isAlive === 'yes' && update.gameTime > -1) {        
        aliveUpdate(update);
    } else {
        deadUpdate(update);
    }

    function aliveUpdate(update: BeatUpdate) {
        const roundLength = 42;
        const mod = update.gameTime % roundLength;
        const round = Math.floor(update.gameTime / roundLength) % points.length;
        const currentPoint = points[round];

        if (mod === 0) {
            devClient.positionShark({
                centerPoint: {x:10,y:300},
                facingAngle: Math.PI * 2 - 0.1,
                sharkId: update.sharkId
            })
            devClient.setMarker({
                lifeSpan: roundLength,
                position: currentPoint
            })
            client.setFinSpeed({port:0,starboard:0});
        }
        if (mod > 6) {
            const position = {x: update.positionX, y: update.positionY};
            const angleToPoint = getAngleToPoint(position, currentPoint);
            const angleDistance = getAngleDifference(update.facing, angleToPoint);
            const distanceToPoint = getDistance(position, currentPoint);
            if (Math.abs(angleDistance) < 0.0001) {
                const finSpeed = Math.min(settings.shark.fins.maxSpeed, distanceToPoint / 2);
                client.setFinSpeed({port:finSpeed,starboard:finSpeed});
            } else if (distanceToPoint > 0.01) {
                const nextMove = getNextMoveToAngle(update.facing, angleToPoint, settings.shark.fins.maxSpeed, settings.shark.fins.minSpeed);
                if (mod === 7) {
                    devClient.setSharkStatus({
                        sharkId: update.sharkId,
                        statusText:`${nextMove.finSpeed.port.toFixed(1)},${nextMove.finSpeed.starboard.toFixed(1)} - ${angleDistance.toFixed(1)}`
                    });
                }
                client.setFinSpeed(nextMove.finSpeed);
            } else {
                client.setFinSpeed({port:0,starboard:0});
            }
        }
    }

    function deadUpdate(deadUpdate: DeadBeatUpdate | BeatUpdate) {
        if (deadUpdate.gameTime % 18 === 0) {
            client
                .takeControl();
        }
    }
}