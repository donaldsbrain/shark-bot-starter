import { describe, expect, test } from '@jest/globals';
import { getIntegerRange } from '../utility/number';

describe('getIntegerRange', () => {
    test('0, 0 produces a single item array of 0', () => {
      const start = 0,
        end = 0;
  
        expect(getIntegerRange(start, end)).toStrictEqual([0]);
    })

    test('1, 1 produces a single item array of 1', () => {
        const start = 1,
          end = 1;
    
          expect(getIntegerRange(start, end)).toStrictEqual([1]);
      })

      test('-1, 1 produces an array of 3: -1, 0, 1', () => {
        const start = -1,
          end = 1;
    
          expect(getIntegerRange(start, end)).toStrictEqual([-1, 0, 1]);
      })
});