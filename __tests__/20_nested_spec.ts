/* eslint no-self-compare: off */

import memoize from '../src/index';

describe('one-level nested spec', () => {
  type State = {
    a: number;
    b: number;
    c: number;
  };

  const getScore = memoize((state: State) => ({
    value: state.a + state.b,
  }));

  const createGetItem = () => {
    const getItem = memoize((state: State) => ({
      score: getScore(state),
    }));
    return getItem;
  };

  const getItemA = createGetItem();
  const getItemB = createGetItem();

  const state1: State = {
    a: 0,
    b: 1,
    c: 2,
  };

  it('works with same parent funcs', () => {
    expect(getItemA(state1) === getItemA(state1)).toBe(true);
    expect(getItemB(state1) === getItemB(state1)).toBe(true);
  });

  it('works with different parent funcs', () => {
    expect(getItemA(state1) === getItemB(state1)).toBe(false);
    expect(getItemA(state1).score === getItemB(state1).score).toBe(true);
  });

  it('works with changing non affected value', () => {
    const state2: State = {
      ...state1,
      c: 3,
    };
    expect(getItemA(state1) === getItemA(state2)).toBe(true);
    expect(getItemB(state1) === getItemB(state2)).toBe(true);
  });

  it('works with changing affected value', () => {
    const state2: State = {
      ...state1,
      a: 1,
    };
    expect(getItemA(state1) === getItemA(state2)).toBe(false);
    expect(getItemB(state1) === getItemB(state2)).toBe(false);
    expect(getItemA(state2).score === getItemB(state2).score).toBe(true);
  });
});
