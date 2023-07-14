type HealthAndEngergyChange = {
    health: number;
    energy: number;
};

type SharkHealthStatus = 'healthy' | 'crippled' | 'immobilized';
type DamageSource = 'laser' | 'torpedo' | 'wall'
export type SharkMode = 'attack' | 'repair' | 'stealth';

export type BeatEvent = LaserFiredEvent | TorpedoDetonatedEvent | TorpedoLostEvent | NarrowScanExecutedEvent | WideScanExecutedEvent | ScanDetectedEvent | DamageTakenEvent | ProximityAlarmEvent | SharkDestroyedEvent | SharkRespawnedEvent;

export type LaserFiredEvent = {
    event: 'laserFiredEvent'
    firingSharkId: string
    commandId: string
    direction: number
    startingPointX: number
    startingPointY: number
    endingPointX: number
    endingPointY: number
    sharkHit: {
        id: string
        name: string
    } | null
}

export type TorpedoDetonatedEvent = {
    event: 'torpedoDetonatedEvent'
    commandId: string
    firingSharkId: string
    sharksHit: {
        id: string
        name: string
    }[]
    detonationPointX: number
    detonationPointY: number
    pointsScored: number
}

export type TorpedoLostEvent = {
    event: 'torpedoLostEvent'
    commandId: string,
    lastKnownPositionX: number
    lastKnownPositionY: number
}

export type NarrowScanExecutedEvent = {
    event: 'narrowScanExecutedEvent'
    commandId: string
    scanFromX: number
    scanFromY: number
    direction: number
    sharks: ScannedShark[]
    torpedoes: ScannedTorpedo[]
}

export type WideScanExecutedEvent = {
    event: 'wideScanExecutedEvent'
    commandId: string
    centerPointX: number
    centerPointY: number
    sharks: {
        sharkId: string
        name: string
        centerX: number
        centerY: number
        speed: number
        direction: number
        healthStatus: SharkHealthStatus
    }[]
    torpedoes: ScannedTorpedo[]
}

export type ScanDetectedEvent = {
    event: 'scanDetectedEvent'
    sourcePositionX: number
    sourcePositionY: number
}

export type DamageTakenEvent = {
    event: 'damageTakenEvent'
    health: number
    energy: number
    source: DamageSource
}

export type ProximityAlarmEvent = {
    event: 'proximityAlarmEvent'
}

export type SharkDestroyedEvent = {
    event: 'sharkDestroyedEvent'
    shark: {
        id: string
        name: string
    }
}

export type SharkRespawnedEvent = {
    event: 'sharkRespawnedEvent'
    shark: {
        id: string
        name: string
    }
}

export type ScannedShark = {
    sharkId: string
    name: string
    centerX: number
    centerY: number
    speed: number
    direction: number
    healthStatus: SharkHealthStatus
}

export type ScannedTorpedo = {
    positionX: number
    positionY: number
    direction: number
    message: string
}

export type CommandUpdate = {
    commandId: string,
    status: 'failed' | 'succeeded' | 'in-progress',
    message: string | null
}

export type ArenaSettings = {
    arenaId: string;
    type: 'development' | 'private' | 'public' | 'official'
    countdownToStart: number;
    gameLength: number;
    dimensions: {
        width: number;
        height: number;
    };
    spectatorDelay: number;
    shark: {
        goldKillCount: number;
        fins: {
            minSpeed: number;
            maxSpeed: number;
            crippledSpeedReduction: number;
            immobilizedSpeedReduction: number;
        };
        dimensions: {
            width: number;
            height: number;
        };
        health: {
            starting: number;
            max: number;
        };
        energy: {
            starting: number;
            max: number;
        };
    };
    torpedo: {
        startingCount: number;
        maxCount: number;
        regenFrequency: number;
        speed: number;
        explosionRange: number;
        explosionToll: HealthAndEngergyChange;
    };
    laser: {
        firingToll: HealthAndEngergyChange;
        hitToll: HealthAndEngergyChange;
    };
    scan: {
        proximityAlarmRange: number; // distance
        wideRange: number; // distance
        wideToll: HealthAndEngergyChange;
        narrowBand: number; // angle
        narrowScanToll: HealthAndEngergyChange;
    };
    outOfBoundsToll: HealthAndEngergyChange;
    deathTimePenalty: {
        // base * previousNumberOfDeaths^perAdditionalMultiplier
        base: number;
        perAdditionalMultiplier: number;
        max: number;
    };
    modeBeatToll: {
        attackMode: HealthAndEngergyChange;
        repairMode: HealthAndEngergyChange;
        stealthMode: HealthAndEngergyChange;
    };
    scoring: {
        perLivingBeat: number;
        perHealthDamageInflicted: number;
        bounty: {
            // base * numberOfUnansweredKills^perAdditionalMultiplier
            base: number;
            perAdditionalMultiplier: number;
            max: number;
        };
    };
};

export type DeadBeatUpdate = {
    sharkId: string
    gameTime: number
    isAlive: 'no'
    respawnAt: number
    events: BeatEvent[]
}

export type BeatUpdate = {
    sharkId: string
    gameTime: number
    isAlive: 'yes'
    mode: SharkMode
    positionX: number
    positionY: number
    facing: number
    energy: number
    health: number
    torpedoCount: number
    portFinSpeedActual: number
    starboardFinSpeedActual: number
    scores: {
        sharkId: string
        sharkName: string
        points: number
        thisLifeKillCount: number
        killCount: number
        diedCount: number
    }[]
    events: BeatEvent[]
}