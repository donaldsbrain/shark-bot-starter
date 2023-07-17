import { Socket, io } from "socket.io-client";
import { Result } from "../utility/result";
import { CommandObservable, createCommandObservable, createRouter } from "../state/commandUpdateRouter";
import { ArenaSettings, BeatUpdate, CommandUpdate, DeadBeatUpdate, SharkMode } from "../dto";
import { Observable } from "rxjs";
import { sharkRest } from "../utility/comms";

interface ClientToServerEvents {
    doStuff: (
        callback: (result: CommandUpdate) => void) => void,    
    takeControl: (
        arenaId: string,
        playerId: string,
        callback: (result: CommandUpdate) => void) => void,
    setFinSpeed: (
        arenaId: string,
        playerId: string,
        portSpeed: number,
        starboardSpeed: number,
        callback: (result: CommandUpdate) => void) => void
    setSharkMode: (
        arenaId: string,
        playerId: string,
        mode: SharkMode,
        callback: (result: CommandUpdate) => void) => void,
    performWideScan: (
        arenaId: string,
        playerId: string,
        callback: (result: CommandUpdate) => void) => void,
    performNarrowScan: (
        arenaId: string,
        playerId: string,
        direction: number,
        callback: (result: CommandUpdate) => void) => void,
    fireTorpedo: (
        arenaId: string,
        playerId: string,
        direction: number,
        callback: (result: CommandUpdate) => void) => void,
    fireLaser: (
        arenaId: string,
        playerId: string,
        callback: (result: CommandUpdate) => void) => void
}

type ServerToClientEvents = {
    commandUpdate: (commandUpdate: CommandUpdate) => void,
    beatUpdate: (beatUpdate: BeatUpdate | DeadBeatUpdate) => void
}

type PlayerClientSettings = {
    host: string
    arenaId: string
    playerId: string
}

type BeatUpdateWithSettings = {
    update: BeatUpdate | DeadBeatUpdate,
    settings: ArenaSettings
}

export class PlayerClient {

    private readonly client;
    public readonly arenaSettings;
    public readonly playerId;
    private readonly commandRouter;
    public readonly sharkId;    
    
    private constructor(
        client: Socket<ServerToClientEvents, ClientToServerEvents>, 
        arenaSettings: ArenaSettings, 
        playerId: string,
        sharkId: string) {

        this.client = client;
        this.playerId = playerId;
        this.arenaSettings = arenaSettings;
        this.sharkId = sharkId;
        this.commandRouter = createRouter();

        client.on('commandUpdate', this.commandRouter.route);
    }

    public disconnect() {
        this.client.close();
    }

    public fireLaser() {
        const observable = createCommandObservable();
        this.client.emit(
            'fireLaser', 
            this.arenaSettings.arenaId, 
            this.playerId,
            update => {
                this.commandRouter.observe(update.commandId, observable);
                this.commandRouter.route(update);
            });
        return observable.observable;
    }

    public fireTorpedo(direction: number) {
        const observable = createCommandObservable();
        this.client.emit(
            'fireTorpedo', 
            this.arenaSettings.arenaId, 
            this.playerId,
            direction,
            update => {
                this.commandRouter.observe(update.commandId, observable);
                this.commandRouter.route(update);
            });
        return observable.observable;
    }

    public narrowScan(direction: number) {
        const observable = createCommandObservable();
        this.client.emit(
            'performNarrowScan', 
            this.arenaSettings.arenaId, 
            this.playerId,
            direction,
            update => {
                this.commandRouter.observe(update.commandId, observable);
                this.commandRouter.route(update);
            });
        return observable.observable;
    }

    public setFinSpeed(finSpeed: {port: number, starboard: number}) {
        const observable = createCommandObservable();
        this.client.emit(
            'setFinSpeed', 
            this.arenaSettings.arenaId, 
            this.playerId, 
            finSpeed.port,
            finSpeed.starboard,
            update => {
                this.commandRouter.observe(update.commandId, observable);
                this.commandRouter.route(update);
            });
        return observable.observable;
    }

    public setSharkMode(mode: SharkMode) {
        const observable = createCommandObservable();
        this.client.emit(
            'setSharkMode', 
            this.arenaSettings.arenaId, 
            this.playerId,
            mode,
            update => {
                this.commandRouter.observe(update.commandId, observable);
                this.commandRouter.route(update);
            });
        return observable.observable;
    }

    public takeControl() {
        const observable = createCommandObservable();        
        PlayerClient.takeControl(
            this.client,
            this.arenaSettings.arenaId,
            this.playerId,
            update => {
                this.commandRouter.observe(update.commandId, observable);
                this.commandRouter.route(update);
            }
        )
        return observable;
    }

    public wideScan() {
        const observable = createCommandObservable();
        this.client.emit(
            'performWideScan', 
            this.arenaSettings.arenaId, 
            this.playerId,
            update => {
                this.commandRouter.observe(update.commandId, observable);
                this.commandRouter.route(update);
            });
        return observable.observable;
    }

    public updates() {        
        return new Observable<BeatUpdateWithSettings>(subscriber => {                        ;
            const onUpdate = (update: BeatUpdate | DeadBeatUpdate) => {                
                subscriber.next({
                    settings: this.arenaSettings,
                    update
                })};
            this.client.on('beatUpdate', onUpdate);
            subscriber.add(() => this.client.off('beatUpdate', onUpdate));            
        });
    }

    public static create(settings: PlayerClientSettings): Promise<PlayerClient> {
        
        return new Promise<PlayerClient>((resolve, reject) => {
            try
            {
                const client: Socket<ServerToClientEvents, ClientToServerEvents> = io(settings.host);            
                client.on('connect_error', reject);
                client.on('connect', () => sharkRest<ArenaSettings>({
                    uri: `${settings.host}arena/${settings.arenaId}/settings`,
                    verb: 'GET'
                }).then(arenaSettings => {
                    const onBeatUpdate = (update: BeatUpdate | DeadBeatUpdate) => {
                        client.off('beatUpdate', onBeatUpdate);                        
                        const playerClient = new PlayerClient(client, arenaSettings, settings.playerId, update.sharkId);                    
                        resolve(playerClient);
                    }
                    client.on('beatUpdate', onBeatUpdate);
                    PlayerClient.takeControl(client, arenaSettings.arenaId, settings.playerId, update => {
                        if (update.status === 'failed') {
                            reject(update.message);
                        }                        
                    });
                }));
            } catch (e) {
                reject(e);
            }
        });
    }

    private static takeControl(
        client: Socket<ServerToClientEvents, ClientToServerEvents>, 
        arenaId: string, 
        playerId: string,
        callback: (update: CommandUpdate) => void) {
        client.emit(
            'takeControl', 
            arenaId, 
            playerId,
            callback);
    }
}