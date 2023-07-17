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