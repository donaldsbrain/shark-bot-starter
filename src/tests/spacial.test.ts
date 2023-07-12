import { describe, it, expect, test } from '@jest/globals';
import { getAngleDifference, getAngleToPoint, getDistance } from '../domain/spacial';

describe('getAngleDifference', () => {
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