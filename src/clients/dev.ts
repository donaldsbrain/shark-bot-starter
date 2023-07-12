import { Point } from "../domain/spacial";
import { ArenaSettings } from "../dto";
import { sharkRest } from "../utility/comms";

type DevClientSettings = {
    host: string
    arenaId: string
}

type SharkToPosition = {
    sharkId: string
    centerPoint: Point
    facingAngle: number
}

export class DevClient {
    private host;
    private isDevelopment;
    private arenaId;

    private constructor(host: string, arenaSettings: ArenaSettings) {
        this.host = host;
        this.isDevelopment = arenaSettings.type === 'development';
        this.arenaId = arenaSettings.arenaId;
    }

    private requireDevelopment<T>(action: () => Promise<T>) {
        if (this.isDevelopment) {
            return action();
        } else {
            return Promise.reject('This action is only valid for arenas of type "development".');
        }
    }

    public clockSlowDown(rate: number) {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/clock-slowdown`,
            verb: 'PUT',
            body: { 
                arenaId: this.arenaId, 
                rate 
            }
        }));
    }

    public positionShark(position: SharkToPosition) {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/sharks/position`,
            verb: 'PUT',
            body: { 
                arenaId: this.arenaId, 
                sharks: [
                    {
                        sharkId: position.sharkId,
                        centerPointX: position.centerPoint.x,
                        centerPointY: position.centerPoint.y,
                        facingAngle: position.facingAngle
                    }
                ] 
            }
        }));
    }

    public resetArena() {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/reset-arena`,
            verb: 'POST',
            body: { 
                arenaId: this.arenaId 
            }
        }));
    }

    public static create(settings: DevClientSettings) {
        return new Promise<DevClient>((resolve, reject) => {
            try
            {
                sharkRest<ArenaSettings>({
                    uri: `${settings.host}arena/${settings.arenaId}/settings`,
                    verb: 'GET'
                }).then(arenaSettings => {                    
                    resolve(new DevClient(settings.host, arenaSettings))
                }).catch(reject);
            } catch (e) {
                reject(e);
            }
        });
    }
}