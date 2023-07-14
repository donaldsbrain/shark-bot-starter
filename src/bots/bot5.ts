import { DevClient } from "../clients/dev";
import { PlayerClient } from "../clients/player";
import { getAngleToPoint, getNewPosition, getNextMoveToAngle } from "../domain/spacial";
import { ArenaSettings, BeatUpdate, DeadBeatUpdate, LaserFiredEvent, NarrowScanExecutedEvent, ScannedTorpedo } from "../dto";

let defenderPoint = {x: 25, y: 25};
const torpedoFrequency = 24;
const gameLength = 1400;
const maxTorpedoes = 6;

export function startBot5(defender: PlayerClient, attacker: PlayerClient, devClient: DevClient) {
    
    defender
        .updates()
        .subscribe(update => handleUpdates(defender, update, devClient))

    attacker
        .updates()
        .subscribe(update => handleAttackerUpdates(attacker, update, devClient))
}

function handleAttackerUpdates(
    client: PlayerClient, 
    {settings, update}: {settings:ArenaSettings, update: BeatUpdate | DeadBeatUpdate},
    devClient: DevClient) {

    if (update.gameTime === 0) {
        devClient.tweakTorpedoRegenFrequency(torpedoFrequency);
        devClient.positionShark({
            centerPoint: {x: settings.dimensions.width - 25, y: settings.dimensions.height / 2 },
            facingAngle: Math.PI * 1.5,
            sharkId: update.sharkId
        })
    }
    const mod = update.gameTime % torpedoFrequency;    
    if (mod === 0) {
        devClient.reviveSharks([update.sharkId]);
    }
    if (mod === 1) {
        const torpedoCount = Math.floor((update.gameTime / gameLength) * maxTorpedoes) + 1;        
        for (let i = 0; i < torpedoCount; i++) {
            const startingPoint = getRandomStartingPoint();
            devClient.createTorpedo({
                direction: getAngleToPoint(startingPoint, defenderPoint),
                firingSharkId: update.sharkId,
                startingPosition: startingPoint
            });
        }
        function getRandomStartingPoint() {
            return {
                x: settings.dimensions.width - 1,
                y: Math.random() * settings.dimensions.height
            };
        }
    }
}

type Target = { 
    gameTime: number, 
    torpedo: ScannedTorpedo 
}
let targets: Target[] = [];

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
        const mod = update.gameTime % torpedoFrequency;
        const position = {x: update.positionX, y: update.positionY};
        if (mod === 0) {
            defenderPoint = {x: 25, y: settings.dimensions.height / 2};
            devClient.positionShark({
                sharkId: update.sharkId,
                centerPoint: defenderPoint,
                facingAngle: Math.PI / 2
            })
            //devClient.reviveSharks([update.sharkId]);
            targets = [];            
        }
        targets = [...targets, ...update
            .events
            .filter(e => e.event === 'narrowScanExecutedEvent')
            .map(e => e as NarrowScanExecutedEvent)
            .flatMap(e => e.torpedoes.map(t => ({
                gameTime: update.gameTime,
                torpedo: t
            })))]
            .sort((a,b) => a.torpedo.positionX - b.torpedo.positionX);
        if (targets.length === 0) {
            const scanRate = 21;
            if (update.gameTime % scanRate === 0) {
                client.narrowScan(getAngleToPoint(position, {
                    x: settings.dimensions.width,
                    y: settings.dimensions.height / 2
                }))
            }
            if (update.gameTime % scanRate === 1) {
                client.narrowScan(getAngleToPoint(position, {
                    x: settings.dimensions.width,
                    y: settings.dimensions.height
                }))                
            }
            if (update.gameTime % scanRate === 2) {
                client.narrowScan(getAngleToPoint(position, {
                    x: settings.dimensions.width,
                    y: 0
                }))
            }
        }
        update.events.filter(e => e.event === 'laserFiredEvent').forEach(console.log);
        if (targets.length > 0) {
            killTorpedo(targets[0]);
        } else {
            client.setFinSpeed({port:0,starboard:0});
        }
        devClient.setSharkStatus({
            sharkId: update.sharkId,
            statusText: targets.length === 0 ? '🦈' : '🔫'
        })
        function killTorpedo(t: Target) {
            const beatsSince = (update.gameTime - t.gameTime) + 1;
            const newPosition = getNewPosition(
                {x: t.torpedo.positionX, y: t.torpedo.positionY}, 
                t.torpedo.direction,
                settings.torpedo.speed * beatsSince);
            const angleTo = getAngleToPoint(position, newPosition);
            const nextMove = getNextMoveToAngle(update.facing, angleTo, settings.shark.fins.maxSpeed, settings.shark.fins.minSpeed);
            client.setFinSpeed(nextMove.finSpeed);
            if (!nextMove.moreMovesRequired) {
                client.fireLaser();
                client.setFinSpeed({port:0,starboard:0});
                if (typeof targets === 'object') {
                    targets = targets.slice(1);
                    devClient.awardPoints({
                        points: 30,
                        sharkId: update.sharkId
                    })
                }
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