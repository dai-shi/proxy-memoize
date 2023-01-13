import { memoize } from '../src/index';

describe('issue #59', () => {
  it('no duplicated property access', () => {
    type State = { a: number; b: number };
    const state1: State = { a: 1, b: 2 };

    const getA = memoize((state: State) => state.a);

    let count = 0;
    const state2: State = new Proxy({ a: 11, b: 22 }, {
      get(target, prop: 'a' | 'b') {
        if (prop === 'a') {
          count += 1;
        }
        return target[prop];
      },
    });

    expect(getA(state1)).toBe(1);
    expect(getA(state2)).toBe(11);
    const savedCount = count;
    expect(getA(state2)).toBe(11);
    expect(count).toBe(savedCount);
  });
});
