function normalizeAngle(theAngle: number): number {
    const fullCircle = Math.PI * 2;
    const normalized = theAngle % fullCircle;
    return normalized < 0 ? normalized + fullCircle : normalized;
}

export type NextMove = {
    finSpeed: {port: number, starboard: number}
    moreMovesRequired: boolean
}

export type Point = {
    x: number
    y: number
}

export function getAngleDifference(source: number, target: number) { 
    const diff = normalizeAngle(target) - normalizeAngle(source);
    return diff > Math.PI ? diff - Math.PI * 2
        : diff < -Math.PI ? diff + Math.PI * 2
        : diff;
}

export function getAngleToPoint(
    source: Point,
    target: Point
): number {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    return normalizeAngle(Math.atan2(dx, dy));
}

export const getDistance = (a: Point, b: Point) => {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export const getNextMoveToAngle = (
    currentFacingAngle: number, 
    targetFacingAngle: number, 
    maxFinSpeed: number, 
    minFinSpeed: number): NextMove => {

    const diff = getAngleDifference(currentFacingAngle, targetFacingAngle);
    const absMaxFinSpeed = Math.min(maxFinSpeed, Math.abs(minFinSpeed));
    const maxAngleChange = absMaxFinSpeed / 5;
    if (diff > maxAngleChange) {
        return {
            moreMovesRequired: true,
            finSpeed: {port: absMaxFinSpeed, starboard: -absMaxFinSpeed}
        }
    } else if (diff < -maxAngleChange) {
        return {
            moreMovesRequired: true,
            finSpeed: {port: -absMaxFinSpeed, starboard: absMaxFinSpeed}
        }
    } else {
        const port = (diff / maxAngleChange) * absMaxFinSpeed;
        return {
            moreMovesRequired: false,
            finSpeed: {port, starboard: -port}
        }
    }
}