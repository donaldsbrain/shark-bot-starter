import { DevClient } from "../clients/dev";
import { PlayerClient } from "../clients/player";
import { getAngleDifference, getAngleToPoint, getDistance, getNextMoveToAngle } from "../domain/spacial";
import { ArenaSettings, BeatUpdate, DeadBeatUpdate } from "../dto";
import { getRandomPoints } from "./bot3";

let randomPointer = 0;
let randomPoints: {x:number,y:number}[] = [];

function getNextRandomPoint() {
    randomPointer = (randomPointer + 1) % randomPoints.length;
    return getCurrentRandomPoint();
}

function getCurrentRandomPoint() {
    return randomPoints[randomPointer]; 
}


export function startBot3a(client: PlayerClient, devClient: DevClient) {
    
    client
        .updates()
        .subscribe(update => handleUpdates(client, update, devClient))
}

function handleUpdates(
    client: PlayerClient, 
    {settings, update}: {settings:ArenaSettings, update: BeatUpdate | DeadBeatUpdate},
    devClient: DevClient) {
    if (update.gameTime < 24) {
        if (update.gameTime === 9) {
            randomPoints = getRandomPoints();
        }
        return;
    }
    if (update.isAlive === 'yes' && update.gameTime > -1) {        
        aliveUpdate(update);
    } else {
        deadUpdate(update);
    }

    function aliveUpdate(update: BeatUpdate) {
        if (update.gameTime === 1) {
            devClient.positionShark({
                centerPoint: {x: 1, y: 1},
                facingAngle: Math.PI * Math.PI,
                sharkId: update.sharkId
            })
        }
        const randomPoint = getCurrentRandomPoint();
        const nextMoveToAngle = (newAngle: number) => getNextMoveToAngle(update.facing, newAngle, settings.shark.fins.maxSpeed, settings.shark.fins.minSpeed);
        const position = {x: update.positionX, y: update.positionY};
        if (getDistance(position, randomPoint) < 0.001) {
            devClient.awardPoints({
                sharkId: update.sharkId,
                points: 10
            })
            getNextRandomPoint();
            devClient.reviveSharks([update.sharkId]);
            return;
        } 

        const angleToPoint = getAngleToPoint(position, randomPoint);
        const angleDiff = Math.abs(getAngleDifference(angleToPoint,update.facing));
        if (angleDiff <=  0.00001) {
            const distance = getDistance(position, randomPoint);
            const finSpeed = Math.min(distance / 2, settings.shark.fins.maxSpeed);
            client.setFinSpeed({port: finSpeed, starboard: finSpeed});
        } else if (angleDiff < Math.PI / 2) {
            client.setFinSpeed(maximizeSpeed(nextMoveToAngle(angleToPoint).finSpeed));
        } else {
            client.setFinSpeed(nextMoveToAngle(angleToPoint).finSpeed);
        }
        

        function maximizeSpeed(speed: {port:number,starboard:number}) {
            const max = settings.shark.fins.maxSpeed;
            const topFin = Math.max(speed.port, speed.starboard);
            const toAdd = max - topFin;
            return {
                port: Math.min(speed.port + toAdd, max),
                starboard: Math.min(speed.starboard + toAdd, max)
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

