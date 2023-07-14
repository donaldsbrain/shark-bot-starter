import { DevClient } from "../clients/dev";
import { PlayerClient } from "../clients/player";
import { getAngleDifference, getAngleToPoint, getDistance, getNextMoveToAngle } from "../domain/spacial";
import { ArenaSettings, BeatUpdate, DeadBeatUpdate } from "../dto";

let randomPointer = 0;
const randomPoints: {x:number,y:number}[] = [{x:1,y:1}];

export function getRandomPoints() {
    return randomPoints;
}

function setRandomPoints(settings: ArenaSettings) {
    for (let i = 0; i < 1000; i++) {
        randomPoints.push({
            x: Math.random() * settings.dimensions.width,
            y: Math.random() * settings.dimensions.height,
        });
    }
}

function getNextRandomPoint() {
    randomPointer = (randomPointer + 1) % randomPoints.length;
    return getCurrentRandomPoint();
}

function getCurrentRandomPoint() {
    return randomPoints[randomPointer]; 
}

export function startBot3(client: PlayerClient, devClient: DevClient) {    
    client
        .updates()
        .subscribe(update => handleUpdates(client, update, devClient))
}

function handleUpdates(
    client: PlayerClient, 
    {settings, update}: {settings:ArenaSettings, update: BeatUpdate | DeadBeatUpdate},
    devClient: DevClient) {
    if (randomPoints.length === 1) {
        setRandomPoints(settings);
    }
    if (update.isAlive === 'yes' && update.gameTime > -1) {        
        aliveUpdate(update);
    } else {
        deadUpdate(update);
    }

    function aliveUpdate(update: BeatUpdate) {
        const randomPoint = getCurrentRandomPoint();
        const nextMoveToAngle = (newAngle: number) => getNextMoveToAngle(update.facing, newAngle, settings.shark.fins.maxSpeed, settings.shark.fins.minSpeed);
        const position = {x: update.positionX, y: update.positionY};
        if (getDistance(position, randomPoint) < 0.001) {
            devClient.awardPoints({
                sharkId: update.sharkId,
                points: 10
            })
            newRandomPoint();
        } 

        const angleToPoint = getAngleToPoint(position, randomPoint);
        if (Math.abs(angleToPoint - update.facing) > 0.00001) {
            devClient.reviveSharks([update.sharkId]);
            client.setFinSpeed(nextMoveToAngle(angleToPoint).finSpeed);
        } else {
            const distance = getDistance(position, randomPoint);
            const finSpeed = Math.min(distance / 2, settings.shark.fins.maxSpeed);
            client.setFinSpeed({port: finSpeed, starboard: finSpeed});
        }

        function newRandomPoint(): void {            
            devClient.setMarker({
                lifeSpan: 120,
                position: getNextRandomPoint(),
                sharkId: update.sharkId
            })
        }        
    }

    function deadUpdate(deadUpdate: DeadBeatUpdate | BeatUpdate) {
        if (deadUpdate.gameTime % 18 === 0) {
            client
                .takeControl();
        }
    }
}

