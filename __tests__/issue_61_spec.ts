import { memoize } from '../src/index';

describe('issue #61', () => {
  it('complex selectors', () => {
    type RootState = { itemA: number };
    const state1: RootState = { itemA: 1 };
    const state2: RootState = { itemA: 2 };

    const getSelectorC = jest.fn((x) => x);
    const GetSelectorC = memoize(({
      state,
    }: {
      state: RootState;
      props: unknown;
    }) => getSelectorC({
      itemA: state.itemA,
    }));

    const getSelectorB = jest.fn((x) => x);
    const GetSelectorB = memoize(({
      state,
      props,
    }: {
      state: RootState;
      props: unknown;
    }) => getSelectorB({
      itemC: GetSelectorC({ state, props }),
    }));

    const getSelectorA = jest.fn((x) => x);
    const GetSelectorA = memoize(({
      state,
      props,
    }: {
      state: RootState;
      props: unknown;
    }) => getSelectorA({
      itemA: state.itemA,
      itemB: GetSelectorB({ state, props }),
    }));

    expect(GetSelectorA({ state: state1, props: {} })).toEqual({
      itemA: 1,
      itemB: { itemC: { itemA: 1 } },
    });
    expect(getSelectorA).toBeCalledTimes(1);
    expect(getSelectorB).toBeCalledTimes(1);
    expect(getSelectorC).toBeCalledTimes(1);
    expect(GetSelectorA({ state: state2, props: {} })).toEqual({
      itemA: 2,
      itemB: { itemC: { itemA: 2 } },
    });
    expect(getSelectorA).toBeCalledTimes(2);
    expect(getSelectorB).toBeCalledTimes(2);
    expect(getSelectorC).toBeCalledTimes(2);
  });
});
