import { memoize } from '../src/index';

const noop = (x: unknown) => x;

describe('issue #63', () => {
  it('triple nested memoized selectors', () => {
    type State = { obj: {}, num: number };
    const state1: State = { obj: {}, num: 1 };
    const state2: State = { ...state1, num: 2 };

    const selectNumA = memoize((state: State) => state.num);
    const selectNumB = memoize((state: State) => {
      noop(state.obj); // touch obj
      return selectNumA(state);
    });
    const selectNumC = memoize((state: State) => selectNumB(state));

    selectNumB(state1); // call it in advance

    expect(selectNumC(state1)).toBe(1);
    expect(selectNumC(state2)).toBe(2);
  });
});
