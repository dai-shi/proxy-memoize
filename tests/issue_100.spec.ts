import { describe, expect, it } from 'vitest';
import { memoize } from 'proxy-memoize';

describe('#100', () => {
  it('should select correctly', () => {
    type State = {
      book1: {
        staticProp: string;
        priceString: string;
      };
    };

    const state1: State = {
      book1: {
        staticProp: '5',
        priceString: '10',
      },
    };

    const state2: State = {
      book1: {
        staticProp: '5',
        priceString: '20',
      },
    };

    const selectAllBooks = memoize((state: State) => Object.values(state));

    const selectPriceString = memoize(
      (state: State) => state.book1.priceString,
    );

    const selectAdjustedPriceString = memoize((state: State) => {
      const priceString = selectPriceString(state);
      state.book1.staticProp; // touch the prop
      return priceString;
    });

    selectAllBooks(state1);

    expect(selectAdjustedPriceString(state1)).toBe('10');
    expect(selectAdjustedPriceString(state2)).toBe('20');
  });
});
