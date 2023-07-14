import { ArenaClient } from "./clients/arena";
import { startBot1 } from "./bots/bot1";
import { PlayerClient } from "./clients/player";
import { DevClient } from "./clients/dev";
import { startBot2 } from "./bots/bot2";
import { startBot3 } from "./bots/bot3";
import { startBot3a } from "./bots/bot3a";

const host = 'http://localhost:3000/';

const devSettings = {
    countdownToStart: 12*10,
    gameLength: 12*60*2
}

const createPlayers = (arenaId: string, arenaClient: ArenaClient) => 
    arenaClient.createPlayers(arenaId, [
        'Perfect',
        'Hurry',
        // 'Bot 3',
        // 'Bot 4',
        // 'Bot 5',
        // 'Bot 6',
        // 'Bot 7',
        // 'Bot 8'
    ]);


const createDevelopmentArenaWithBots = (host: string) => {
    const arenaClient = ArenaClient.create(host);
    return arenaClient
        .createDevelopment(devSettings)
        .then(arenaCreated => createPlayers(arenaCreated.arenaId, arenaClient)
            .then(playersCreated => {console.log(arenaCreated, playersCreated); return playersCreated;})
            .then(playersCreated => ({arenaId: arenaCreated.arenaId, playersCreated})))
}

const createBotsInExistingArena = (host: string, arenaId: string) => {
    const arenaClient = ArenaClient.create(host);
    return createPlayers(arenaId, arenaClient)
        .then(playersCreated => ({arenaId, playersCreated}))
}

const startOverWithExisting = (host: string, arenaId: string, playerIds: string[]) => {
    Promise
        .all(playerIds
            .map(playerId => PlayerClient.create({
                host,
                arenaId,
                playerId
            })))
        .then(playerClients => {
            DevClient.create({
                arenaId,
                host
            }).then(devClient => {
                devClient.resetArena();
                devClient.clockSlowDown(1);                
                playerClients
                    .forEach((pc,i) => {
                        if (i < 7) {
                            startBot1(pc, devClient)
                        }
                    });                    
            })
        })
}

// startOverWithExisting(host, 'FYY-YYY-YYYM', [
//     '2235946c-ef97-4d90-8565-27638640be23',    
//     '5b3c77a0-d954-42d8-afb7-9f346625ba36',    
//     'a3487c2f-c271-4a3d-a563-85b16591e8c1',    
//     '26fdadc3-f9ce-43d7-aa0a-f2a6c5237394',    
//     'de09e56a-fe34-45e2-a9fa-cc7863984a0f',    
//     '7bb42fc4-d392-4cc7-806b-d5f4bda5e5a7',    
//     '14a10bac-b004-4505-90b7-e2c20e4df795',    
//     '6530dcc0-0b9e-4f58-80de-58afbdeaa306'
// ])

createDevelopmentArenaWithBots(host)
    .then(arenaCreated => {
        DevClient.create({
            arenaId: arenaCreated.arenaId,
            host
        }).then(devClient => {
            devClient.tweakPointsPerLivingBeat(0);            
            // devClient.tweakTorpedoRegenFrequency(1);
            // devClient.tweakLaserEnergyToll(-1);
            return Promise.all(arenaCreated.playersCreated.map((player, i) => PlayerClient.create({
                host,
                arenaId: arenaCreated.arenaId,
                playerId: player.playerId
            }).then(playerClient => {
                if (i === 0)
                    startBot3(playerClient, devClient)
                else
                    startBot3a(playerClient, devClient)
            })))
        })
    })
    