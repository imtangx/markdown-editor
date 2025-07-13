import { describe, it, expect } from 'vitest';
import { createPosition, isPositionInRange, createRange } from '../src';

describe('position-utils', () => {
  it('should create a position object', () => {
    const position = createPosition(1, 5, 10);

    expect(position.line).toBe(1);
    expect(position.column).toBe(5);
    expect(position.offset).toBe(10);
  });

  it('should check the position in the range', () => {
    const start = createPosition(1, 1, 0);
    const end = createPosition(1, 10, 9);
    const range = createRange(start, end);

    const positionInside = createPosition(1, 5, 4);
    const positionOutside = createPosition(1, 15, 14);

    expect(isPositionInRange(positionInside, range)).toBe(true);
    expect(isPositionInRange(positionOutside, range)).toBe(false);
  });
});
