import memoize from '../src/index';

describe('basic spec', () => {
  it('x.a', () => {
    const fn = memoize((x: { a: number }) => ({ a: x.a }));
    expect(fn({ a: 1 })).toEqual({ a: 1 });
    expect(fn({ a: 2 })).toBe(fn({ a: 2 }));
  });

  it('x.a/b/c', () => {
    const fn = memoize((x: { a: number, b: number, c?: number }) => (
      { a: x.a, b: x.b }
    ));
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
