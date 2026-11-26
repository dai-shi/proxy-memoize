import { describe, expect, it } from 'vitest';
import { memoize } from 'proxy-memoize';

describe('read-only properties in the result', () => {
  type State = { a: { v: number }; b: { v: number } };
  const state: State = { a: { v: 1 }, b: { v: 2 } };

  it('should not throw for a frozen result', () => {
    const fn = memoize((s: State) => Object.freeze({ a: s.a }));
    const result = fn(state);
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.a.v).toBe(1);
  });

  it('should not throw for a frozen array result', () => {
    const fn = memoize((s: State) => Object.freeze([s.a, s.b]));
    const result = fn(state);
    expect(result.map((x) => x.v)).toEqual([1, 2]);
  });

  it('should not throw for a getter-only property in the result', () => {
    const fn = memoize((s: State) => ({
      get a() {
        return s.a;
      },
    }));
    expect(fn(state).a.v).toBe(1);
  });

  it('should still unwrap a frozen object nested in a plain object', () => {
    const fn = memoize((s: State) => ({
      x: s.a,
      y: Object.freeze({ b: s.b }),
    }));
    const result = fn(state);
    expect(result.x).toBe(state.a);
    expect(result.y.b.v).toBe(2);
  });

  it('should recompute when the state changes', () => {
    const fn = memoize((s: State) => Object.freeze({ v: s.a.v }));
    expect(fn(state).v).toBe(1);
    expect(fn({ ...state, a: { v: 3 } }).v).toBe(3);
  });
});
