import { describe, expect, it } from 'vitest';
import { memoize } from 'proxy-memoize';

describe('basic spec', () => {
  it('x.a', () => {
    const fn = memoize((x: { a: number }) => ({ a: x.a }));
    expect(fn({ a: 1 })).toEqual({ a: 1 });
    expect(fn({ a: 2 })).toBe(fn({ a: 2 }));
  });

  it('x.a/b/c', () => {
    const fn = memoize((x: { a: number; b: number; c?: number }) => ({
      a: x.a,
      b: x.b,
    }));
    expect(fn({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
    expect(fn({ a: 1, b: 2, c: 3 })).toEqual({ a: 1, b: 2 });
    expect(fn({ a: 2, b: 3, c: 4 })).toBe(fn({ a: 2, b: 3, c: 5 }));
  });

  it('x.a.b', () => {
    const fn = memoize((x: { a: { b: number } }) => ({ a: x.a }));
    expect(fn({ a: { b: 1 } })).toEqual({ a: { b: 1 } });
    const a = { b: 2 };
    expect(fn({ a })).toBe(fn({ a }));
  });
});

describe('circular object', () => {
  it('simple array', () => {
    const fn = memoize((x: { a: number }) => {
      const arr: unknown[] = [x.a];
      arr.push(arr);
      return arr;
    });
    expect(fn({ a: 1 })).toBe(fn({ a: 1 }));
  });
});

describe('returning objects args', () => {
  it("x checked, x returned, don't memoize", () => {
    const fn = memoize((x: { a: number; b: number }) => x);
    expect(fn({ a: 1, b: 1 })).not.toBe(fn({ a: 1, b: 2 }));
  });

  it("x.a checked, x returned, don't memoize", () => {
    const fn = memoize((x: { a: number; b: number }) => {
      if (x.a) {
        return x;
      }
      return null;
    });
    expect(fn({ a: 1, b: 1 })).not.toBe(fn({ a: 1, b: 2 }));
  });

  it("x.a checked, x.a returned, don't memoize", () => {
    const fn = memoize((x: { a: { b: number; c: number } }) => {
      if (x.a) {
        return x.a;
      }
      return null;
    });
    expect(fn({ a: { b: 1, c: 1 } })).not.toBe(fn({ a: { b: 1, c: 2 } }));
  });

  it("x.a.b checked, x.a returned, don't memoize", () => {
    const fn = memoize((x: { a: { b: number; c: number } }) => {
      if (x.a.b) {
        return x.a;
      }
      return null;
    });
    expect(fn({ a: { b: 1, c: 1 } })).not.toBe(fn({ a: { b: 1, c: 2 } }));
  });

  it("x.a.b checked, x.a returned and nested, don't memoize", () => {
    const fn = memoize((x: { a: { b: number; c: number } }) => {
      if (x.a.b) {
        return { d: { e: x.a } };
      }
      return null;
    });
    expect(fn({ a: { b: 1, c: 1 } })).not.toBe(fn({ a: { b: 1, c: 2 } }));
  });

  it('x.a.b checked, x.a (same object) returned and nested, do memoize', () => {
    const fn = memoize((x: { a: { b: number; c: number } }) => {
      if (x.a.b) {
        return { d: { e: x.a } };
      }
      return null;
    });
    const a = { b: 1, c: 1 };
    expect(fn({ a })).toBe(fn({ a }));
  });
});
