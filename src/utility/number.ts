export function getIntegerRange(firstNumber: number, lastNumber: number) {
    return [...(new Array(Math.max(0, lastNumber - firstNumber) + 1)).keys()]
        .map(n => n + firstNumber);
}