import { describe, expect, it } from 'vitest';
import { memoizeWithArgs } from 'proxy-memoize';

describe('memoizeWithArgs with an argument the function never reads (#109)', () => {
  type A = { name: string };
  type B = { age: number };
  const a: A = { name: 'x' };
  const b: B = { age: 1 };

  it('should memoize when only the first argument is read', () => {
    let runs = 0;
    const fn = memoizeWithArgs((x: A, _y: B) => {
      runs += 1;
      return x.name;
    });
    expect(fn({ ...a }, { ...b })).toBe('x');
    expect(fn({ ...a }, { ...b })).toBe('x');
    expect(runs).toBe(1);
  });

  it('should memoize when only the second argument is read', () => {
    let runs = 0;
    const fn = memoizeWithArgs((_x: A, y: B) => {
      runs += 1;
      return y.age;
    });
    expect(fn({ ...a }, { ...b })).toBe(1);
    expect(fn({ ...a }, { ...b })).toBe(1);
    expect(runs).toBe(1);
    expect(fn({ ...a }, { age: 2 })).toBe(2);
    expect(runs).toBe(2);
  });

  it('should still compare an argument used as a whole by identity', () => {
    let runs = 0;
    const fn = memoizeWithArgs((x: A, y: B) => {
      runs += 1;
      return [x.name, y] as const;
    });
    const first = fn(a, b);
    expect(fn({ ...a }, b)).toBe(first);
    expect(runs).toBe(1);
    const c = { ...b };
    expect(fn(a, c)[1]).toBe(c);
    expect(runs).toBe(2);
  });

  it('should rerun when the number of arguments changes', () => {
    let runs = 0;
    const fn = memoizeWithArgs((x: A, ..._rest: B[]) => {
      runs += 1;
      return x.name;
    });
    fn(a, b);
    fn(a, b, b);
    expect(runs).toBe(2);
  });
});
