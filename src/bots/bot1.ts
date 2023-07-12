import { DevClient } from "../clients/dev";
import { PlayerClient } from "../clients/player";
import { ArenaSettings, BeatUpdate, DeadBeatUpdate } from "../dto";

export function startBot1(client: PlayerClient, devClient: DevClient) {
    
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
        const mod = update.gameTime % 24;

        const randomTorpedoDirection = (facing: number) => facing + Math.PI / 2 + Math.random() * Math.PI;

        if (update.health < settings.shark.health.max * 0.4 && update.mode !== 'repair') {
            client.setFinSpeed({port:0,starboard:0});
            client.setSharkMode('repair');
        } else if (update.health >= settings.shark.health.max * 0.9 && update.mode === 'repair') {
            client.setSharkMode('attack');
        } else if (update.mode === 'attack') {
            if (update.energy >= -settings.laser.firingToll.energy - settings.modeBeatToll.attackMode.energy) {
                client.fireLaser();
            }
            if (update.torpedoCount > 0) {
                client.fireTorpedo(randomTorpedoDirection(update.facing))
            }
            if (mod === 0) {
                client.setFinSpeed({port:5,starboard:-5});
            }
            if (mod === 1) {
                client.setFinSpeed({port:0,starboard:0});
            }
            if (mod === 2) {
                client.setFinSpeed({port:6,starboard:6});
            }
            if (mod === 12) {
                client.setFinSpeed({port:-5,starboard:-5});
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