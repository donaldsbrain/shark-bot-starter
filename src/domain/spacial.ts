function normalizeAngle(theAngle: number): number {
    const fullCircle = Math.PI * 2;
    const normalized = theAngle % fullCircle;
    return normalized < 0 ? normalized + fullCircle : normalized;
}

export type NextMove = {
    finSpeed: {port: number, starboard: number}    
}

export type Point = {
    x: number
    y: number
}

export function getAngleDifference(source: number, target: number) {    
    const diff = normalizeAngle(target) - normalizeAngle(source);
    return diff <= Math.PI ? diff : Math.PI - diff;
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