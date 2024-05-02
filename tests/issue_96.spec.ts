import { describe, expect, it } from 'vitest';
import { memoize } from 'proxy-memoize';

describe('unused selectors (#96)', () => {
  it('nested memoized selectors with primitive value access', () => {
    type State = {
      ids: string[];
      entities: {
        [id: string]: { name: string; array: string[] };
      };
    };
    const state1: State = {
      ids: ['1'],
      entities: {
        1: { name: 'first', array: [] },
      },
    };
    const state2: State = {
      ids: ['1'],
      entities: {
        1: { name: 'first', array: ['changed'] },
      },
    };
    const selectAll = memoize((state: State) =>
      state.ids.map((id) => state.entities[id]),
    );
    const selectAllNames = memoize((state: State) =>
      state.ids.map((id) => state.entities[id]?.name),
    );
    const intermediateSelector = memoize((state: State) => {
      selectAllNames(state);
      return selectAll(state);
    });
    const finalSelector = memoize((state: State) => {
      const combinedResult = intermediateSelector(state);
      return combinedResult;
    });
    const result1 = finalSelector(state1);
    const result2 = finalSelector(state2);
    expect(result1).not.toEqual(result2);
  });
});
