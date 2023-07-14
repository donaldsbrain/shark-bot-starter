import { Point } from "../domain/spacial";
import { ArenaSettings } from "../dto";
import { sharkRest } from "../utility/comms";

type AwardPoints = {
    sharkId: string
    points: number
}

type CreateTorpedo = {
    firingSharkId: string
    startingPosition: Point
    direction: number
}

type DevClientSettings = {
    host: string
    arenaId: string
}

type SharkToPosition = {
    sharkId: string
    centerPoint: Point
    facingAngle: number
}

type SetMarker = {
    lifeSpan: number
    position: Point
    sharkId?: string
}

type SetSharkStatus = {
    sharkId: string
    statusText: string
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

    public awardPoints(award: AwardPoints) {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/sharks/award-points`,
            verb: 'PUT',
            body: { 
                arenaId: this.arenaId, 
                sharks: [{
                    sharkId: award.sharkId,
                    points: award.points 
                }]
            }
        }));
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

    public createTorpedo(torpedo: CreateTorpedo) {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/create-torpedo`,
            verb: 'POST',
            body: { 
                arenaId: this.arenaId, 
                positionX: torpedo.startingPosition.x,
                positionY: torpedo.startingPosition.y,
                direction: torpedo.direction,
                firingSharkId: torpedo.firingSharkId 
            }
        }));
    }

    public makeSharksDead(sharkIds: string[]) {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/sharks/make-dead`,
            verb: 'POST',
            body: { 
                arenaId: this.arenaId,
                sharkIds
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

    public reviveSharks(sharkIds: string[]) {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/sharks/revive`,
            verb: 'PUT',
            body: { 
                arenaId: this.arenaId,
                sharkIds
            }
        }));
    }

    public setMarker(marker: SetMarker) {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/marker`,
            verb: 'POST',
            body: { 
                arenaId: this.arenaId,
                lifeSpan: marker.lifeSpan,
                x: marker.position.x,
                y: marker.position.y,
                sharkId: marker.sharkId
            }
        }));
    }

    public setSharkStatus(status: SetSharkStatus) {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/spectator-shark-status`,
            verb: 'PUT',
            body: { 
                arenaId: this.arenaId,
                sharkId: status.sharkId,
                status: status.statusText 
            }
        }));
    }

    public tweakLaserHitHealthToll(toll: number) {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/tweak`,
            verb: 'PUT',
            body: { 
                arenaId: this.arenaId, 
                tweakLaserHitHealthToll: toll
            }
        }));
    }

    public tweakLaserEnergyToll(toll: number) {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/tweak`,
            verb: 'PUT',
            body: { 
                arenaId: this.arenaId, 
                laserEnergyToll: toll
            }
        }));
    }

    public tweakMaxDeathTimePenalty(beats: number) {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/tweak`,
            verb: 'PUT',
            body: { 
                arenaId: this.arenaId, 
                maxDeathTimePenalty: beats
            }
        }));
    }

    public tweakMaxEnergy(toll: number) {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/tweak`,
            verb: 'PUT',
            body: { 
                arenaId: this.arenaId, 
                maxEnergy: toll
            }
        }));
    }    

    public tweakMaxHealth(maxHealth: number) {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/tweak`,
            verb: 'PUT',
            body: { 
                arenaId: this.arenaId, 
                maxHealth: maxHealth
            }
        }));
    }

    public tweakPointsPerLivingBeat(pointsPerLivingBeat: number) {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/tweak`,
            verb: 'PUT',
            body: { 
                arenaId: this.arenaId, 
                pointsPerLivingBeat: pointsPerLivingBeat
            }
        }));
    }

    public tweakTorpedoRegenFrequency(frequency: number) {
        return this.requireDevelopment(() => sharkRest({
            uri: `${this.host}development/tweak`,
            verb: 'PUT',
            body: { 
                arenaId: this.arenaId, 
                torpedoRegenFrequency: frequency
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