import { ArenaSettings } from "../dto"
import { sharkRest } from "../utility/comms"

type CreateDevelopmentArena = {    
    countdownToStart: number
    gameLength: number
}

type DevelopmentArenaCreated = {
    arenaId: string;
    arenaType: 'development';
}

type CreatePublicArena = {
    countdownToStart: number
    gameLength: number
}

type PublicArenaCreated = {
    arenaId: string;
    arenaType: 'public';
}

type PlayerCreated = {
    playerId: string;
    sharkId: string;
    name: string;
    color: string;
}

export class ArenaClient {
    private host: string;

    private constructor(host: string) {
        this.host = host;
    }

    public createDevelopment(arena: CreateDevelopmentArena) {
        return sharkRest<DevelopmentArenaCreated>({
            uri: `${this.host}arena/create`,
            verb: 'POST',
            body: { ...arena, arenaType: 'development' }
        });
    }

    public createPublic(arena: CreatePublicArena) {
        return sharkRest<PublicArenaCreated>({
            uri: `${this.host}arena/create`,
            verb: 'POST',
            body: { ...arena, arenaType: 'public' }
        });
    }

    public createPlayers(arenaId: string, sharkNames: string[]) {
        return sharkRest<PlayerCreated[]>({
            uri: `${this.host}arena/${arenaId}/create-players`,
            verb: 'POST',
            body: { arenaId, sharkNames }
        });
    }

    public getArenaSettings(arenaId: string) {
        return sharkRest<ArenaSettings>({
            uri: `${this.host}arena/${arenaId}/settings`,
            verb: 'GET'
        });
    }

    public static create(host: string) {        
        return new ArenaClient(host);
    }
}