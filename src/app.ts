import { startPatrolBot } from "./bots/patrolBot";
import { ArenaClient } from "./clients/arena";
import { DevClient } from "./clients/dev";
import { PlayerClient } from "./clients/player";

const host = 'http://192.168.0.48:3000/';
const arenaClient = ArenaClient.create(host);

const createDevelopmentArena = (gameLength: number, countdownLength: number) => 
    arenaClient
        .createDevelopment({
            gameLength: gameLength,
            countdownToStart: countdownLength
        })


const createPublicArena = (gameLength: number, countdownLength: number) => 
    arenaClient
        .createPublic({
            gameLength: gameLength,
            countdownToStart: countdownLength
        })


const createPlayers = (arenaId: string, sharkNames: string[]) => 
    arenaClient
        .createPlayers(arenaId, sharkNames)
        .then(playersCreated => 
            Promise.all(playersCreated
                .map(pc => PlayerClient.create({
                    host,
                    arenaId: arenaId,
                    playerId: pc.playerId
                }))))

// bot composition root goes here 👇

createDevelopmentArena(12*60, 12*15)
    .then(({arenaId}) => {
        console.log(`Arena created: ${arenaId}`);
        return createPlayers(arenaId, ['BadShark', 'GooShark', 'Bot 3', 'Bot 4', 'Bot 5', 'Bot 6', 'Bot 7', 'Bot 8'])
    })
    .then(players => players.length > 0 ? Promise.resolve(players) : Promise.reject('Ruh roh'))
    .then(playerClients =>  {
        return DevClient.create({
            arenaId: playerClients[0].arenaSettings.arenaId,
            host
        }).then(devClient => playerClients.forEach(pc => startPatrolBot(pc, devClient)));
    })
    .catch(rej => console.error('ERROR!', rej));