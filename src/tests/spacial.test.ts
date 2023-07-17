import { describe, expect, test } from '@jest/globals';
import { getAngleDifference, getAngleToPoint, getDistance, getNewPosition, getNextMoveToAngle } from '../domain/spacial';

describe('getAngleDifference', () => {
  test('difference between 0 rad and 2PI deg is 0', () => {
    const source = 0,
      target = Math.PI * 2;

      expect(getAngleDifference(source, target)).toBe(0);
}); 

test('difference between -1 rad and 1 rad is 2', () => {
  const source = Math.PI * 2 - 1,
    target = 1;

    expect(getAngleDifference(source, target)).toBe(2);
});

    test('difference between 0 deg and 270 deg is -90', () => {
        const source = 0,
          target = Math.PI * 1.5;

          expect(getAngleDifference(source, target)).toBe(-Math.PI*0.5);
    });

    test('difference between two alike angles is zero', () => {
      const source = Math.PI * 0.1 - Math.PI * 2,
        target = Math.PI * 0.1;

        expect(getAngleDifference(source, target)).toBe(0);
    });

    test('difference between 10 deg and 25 deg is 15 deg', () => {
      const source = Math.PI * (10/180),
        target = Math.PI * (25/180)

        expect(getAngleDifference(source, target)).toBeCloseTo(Math.PI * (15/180), 5);
    });

    test('difference between 25 deg and 10 deg is -15 deg', () => {
      const source = Math.PI * (25/180),
        target = Math.PI * (10/180)

        expect(getAngleDifference(source, target)).toBeCloseTo(Math.PI * -(15/180), 5);
    });

    test('difference between 0 rad and (2PI-1) rad is -1 rad', () => {
      const source = 0,
        target = Math.PI * 2 - 1

        expect(getAngleDifference(source, target)).toBeCloseTo(-1, 5);
    });
})

describe('getAngleToPoint', () => {
    test('origin to 5,5 is 45 deg angle', () => {
      const source = {x:0,y:0},
        target = {x:5,y:5};
      expect(getAngleToPoint(source, target)).toBe(Math.PI / 4);
    });

    test('origin to -5,5 is 315 deg angle', () => {
      const source = {x:0,y:0},
        target = {x:-5,y:5};
      expect(getAngleToPoint(source, target)).toBe(Math.PI * 1.75);
    });

    test('origin to -5,-5 is 225 deg angle', () => {
      const source = {x:0,y:0},
        target = {x:-5,y:-5};
      expect(getAngleToPoint(source, target)).toBe(Math.PI * 1.25);
    });

    test('point directly above is zero', () => {
      const source = {x:5,y:5},
        target = {x:5,y:10};
      expect(getAngleToPoint(source, target)).toBe(0);
    });

    test('point directly below is 180 deg', () => {
      const source = {x:5,y:5},
        target = {x:5,y:0};
      expect(getAngleToPoint(source, target)).toBe(Math.PI);
    });
});

describe('getDistance', () => {
  test('5 to the right is 5', () => {
    const a = {x:0,y:0},
      b = {x:5,y:0};
    expect(getDistance(a, b)).toBe(5);    
  });

  test('5 to the left is 5', () => {
    const a = {x:0,y:0},
      b = {x:-5,y:0};
    expect(getDistance(a, b)).toBe(5);    
  });

  test('5 up is 5', () => {
    const a = {x:0,y:0},
      b = {x:0,y:5};
    expect(getDistance(a, b)).toBe(5);    
  });

  test('5 down is 5', () => {
    const a = {x:0,y:0},
      b = {x:0,y:-5};
    expect(getDistance(a, b)).toBe(5);    
  });

  test('3, 4, 5 triangle', () => {
    const a = {x:10,y:10},
      b = {x:6,y:7};
    expect(getDistance(a, b)).toBe(5);    
  });
});

describe('getNewPosition', () => {
  test('3, 4, 5 triangle', () => {
    const newPosition = getNewPosition({x:-1,y:-1}, 0.9273, 5);
    expect(newPosition.x).toBeCloseTo(3);
    expect(newPosition.y).toBeCloseTo(2);
  })

  test('1000 random getDistance values', () => {    
    for (let i = 0; i < 1000; i++) {
      const angle = Math.random() * Math.PI * 8 - Math.PI * 4;
      const x = Math.random() * 2000 - 1000;
      const y = Math.random() * 2000 - 1000;
      const distance = Math.random() * 1000;
      const newPosition = getNewPosition({x,y}, angle, distance);
      const calculatedDistance = getDistance({x,y}, newPosition);
      expect(calculatedDistance).toBeCloseTo(distance);
    }
  })
});

describe('getNextMoveToAngle', () => {

  test('one max turn to the right', () => {
    const currentAngle = 0,
      targetAngle = 1,
      maxFinSpeed = 6,
      minFinSpeed = 5;
    expect(getNextMoveToAngle(currentAngle, targetAngle, maxFinSpeed, minFinSpeed))
      .toEqual({
        finSpeed: {port: 5, starboard: -5},
        moreMovesRequired: false
      })
  });

  test('one max turn to the left', () => {
    const currentAngle = 0,
      targetAngle = Math.PI * 2 - 1,
      maxFinSpeed = 6,
      minFinSpeed = 5;
    expect(getNextMoveToAngle(currentAngle, targetAngle, maxFinSpeed, minFinSpeed))
      .toEqual({
        finSpeed: {port: -5, starboard: 5},
        moreMovesRequired: false
      })
  });

  test('two turns to the right', () => {
    const currentAngle = 0,
      targetAngle = 2,
      maxFinSpeed = 6,
      minFinSpeed = 5;
    expect(getNextMoveToAngle(currentAngle, targetAngle, maxFinSpeed, minFinSpeed))
      .toEqual({
        finSpeed: {port: 5, starboard: -5},
        moreMovesRequired: true
      })
  });

  test('two turns to the left', () => {
    const currentAngle = 0,
      targetAngle = Math.PI * 2 - 2,
      maxFinSpeed = 6,
      minFinSpeed = 5;
    expect(getNextMoveToAngle(currentAngle, targetAngle, maxFinSpeed, minFinSpeed))
      .toEqual({
        finSpeed: {port: -5, starboard: 5},
        moreMovesRequired: true
      })
  });

  test('half-speed turn to the left', () => {
    const currentAngle = 0,
      targetAngle = Math.PI * 2 - 0.5,
      maxFinSpeed = 6,
      minFinSpeed = 5;
    expect(getNextMoveToAngle(currentAngle, targetAngle, maxFinSpeed, minFinSpeed))
      .toEqual({
        finSpeed: {port: -2.5, starboard: 2.5},
        moreMovesRequired: false
      })
  });

  test('half-speed turn to the right', () => {
    const currentAngle = Math.PI / 3,
      targetAngle = currentAngle + Math.PI * 2 + 0.5,
      maxFinSpeed = 6,
      minFinSpeed = 5;

    const nextMove = getNextMoveToAngle(currentAngle, targetAngle, maxFinSpeed, minFinSpeed)

    expect(nextMove.finSpeed.port).toBeCloseTo(2.5, 5);
    expect(nextMove.finSpeed.starboard).toBeCloseTo(-2.5, 5);
    expect(nextMove.moreMovesRequired).toEqual(false);
  });

});