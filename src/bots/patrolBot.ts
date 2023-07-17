import { DevClient } from "../clients/dev";
import { PlayerClient } from "../clients/player";
import { Point, getAngleDifference, getAngleToPoint, getDistance, getNewPosition, getNextMoveToAngle } from "../domain/spacial";
import { ArenaSettings, BeatUpdate, DeadBeatUpdate } from "../dto";
import { getIntegerRange } from "../utility/number";

export function startPatrolBot(client: PlayerClient, devClient: DevClient | undefined = undefined) {

    const points: Point[] = [];
    let currentIndex = 0;

    const initializePoints = (arenaSettings: ArenaSettings) => {
        const {width, height} = arenaSettings.dimensions;
        const margin = 20;
        const lapCount = 5;
        
        getIntegerRange(0, lapCount - 1)
            .flatMap(i => ([{
                x: i % 2 === 0 ? margin : width - margin, 
                y: ((height - margin * 2) / (lapCount - 1)) * i + margin
            },{
                x: i % 2 === 1 ? margin : width - margin, 
                y: ((height - margin * 2) / (lapCount - 1)) * i + margin
            }
        ])).forEach(p => points.push(p));
    }
    
    const dev = (devAction: (devClient: DevClient) => void) => {
        if (typeof devClient === 'object') {
            devAction(devClient);
        }
    }

    client
        .updates()
        .subscribe(handleUpdates)
    
    function handleUpdates({settings, update}: {settings:ArenaSettings, update: BeatUpdate | DeadBeatUpdate}) {
    
        if (points.length === 0) {
            initializePoints(settings);
        }

        if (update.isAlive === 'yes' && update.gameTime >= -1) {        
            aliveUpdate(update);
        } else {
            deadUpdate(update);
        }
    
        function aliveUpdate(update: BeatUpdate) {
            const position = {x:update.positionX,y:update.positionY};
            const maxSpeed = Math.max(settings.shark.fins.maxSpeed, Math.abs(settings.shark.fins.minSpeed)) * 2;
            if (getDistance(points[currentIndex], position) < 0.1) {
                advancePoint();
            }
            const currentPoint = points[currentIndex];
            const angleToPoint = getAngleToPoint(position, currentPoint);
            const angleDiff = getAngleDifference(update.facing, angleToPoint);
            const distanceToPoint = getDistance(position, currentPoint);

            if (Math.abs(angleDiff) < 0.001) {
                moveForward(distanceToPoint);
            } else {
                turn(angleToPoint, distanceToPoint);
            }            

            function advancePoint() {                
                currentIndex = (currentIndex+1) % points.length;
                const newPoint = points[currentIndex];

                dev(devClient => {
                    devClient.setMarker({
                        lifeSpan: Math.ceil(getDistance(position, newPoint) / maxSpeed),
                        position: newPoint,
                        sharkId: client.sharkId
                    });
                    devClient.setSharkStatus({
                        sharkId: update.sharkId,
                        statusText: `${currentIndex}`
                    })
                    devClient.awardPoints({
                        points: 10,
                        sharkId: update.sharkId
                    })
                });
            }

            function moveForward(distanceToPoint: number) {
                const singleFinSpeed = Math.min(distanceToPoint, maxSpeed) / 2;
                client.setFinSpeed({
                    port: singleFinSpeed,
                    starboard: singleFinSpeed
                })
            }

            function turn(angleToPoint: number, distanceToPoint: number) {
                const finSpeed = getNextMoveToAngle(update.facing, angleToPoint, settings.shark.fins.maxSpeed, settings.shark.fins.minSpeed).finSpeed;
                client.setFinSpeed(finSpeed);
            }
        }
    
        function deadUpdate(deadUpdate: DeadBeatUpdate | BeatUpdate) {
            const mod = deadUpdate.gameTime % 24;
            if (mod === 0) {
                client.takeControl();
            }
        }
    }
}
