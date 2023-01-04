import { memoize } from '../src/index';

describe('issue #44', () => {
  it('nested selectors', () => {
    type State = {
      ids: number[];
      entities: Record<number, string>;
    };

    const state1: State = {
      ids: [1, 2],
      entities: {},
    };

    const state2: State = {
      ids: [1, 2],
      entities: {
        1: 'e-1',
        2: 'e-2',
        3: 'e-3',
      },
    };

    const getEntityById = memoize(({ state, id }: { state: State, id: number }) => (
      state.entities[id]
    ));

    const getCurrentEntities = memoize((state: State) => (
      state.ids.map((id) => getEntityById({ state, id }))
    ));

    expect(getCurrentEntities(state1)).toEqual([undefined, undefined]);
    expect(getCurrentEntities(state2)).toEqual(['e-1', 'e-2']);
  });
});
