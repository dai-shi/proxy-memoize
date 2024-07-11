import { describe, expect, it } from 'vitest';
import { memoize } from 'proxy-memoize';

describe('Static props prevents selectors recall (#100)', () => {
  it('should select correctly with nested selectors', () => {
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

    const selectBook1 = memoize((state: State) => state.book1);

    const selectPriceString = memoize(
      (state: State) => state.book1.priceString,
    );

    const selectAdjustedPriceString = memoize((state: State) => {
      const priceString = selectPriceString(state);
      state.book1.staticProp; // touch the prop
      return priceString;
    });

    selectBook1(state1);

    expect(selectAdjustedPriceString(state1)).toBe('10');
    expect(selectAdjustedPriceString(state2)).toBe('20');
  });

  it('case 2', () => {
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
        priceString: '0',
      },
    };

    const selectBook1 = memoize((state: State) => state.book1);

    const selectPriceString = memoize(
      (state: State) => state.book1.priceString,
    );

    const selectAdjustedPriceString = memoize((state: State) => {
      const priceString = selectPriceString(state);
      state.book1.staticProp; // touch the prop
      return priceString;
    });

    const selectMemoizedPriceString = memoize((state: State) =>
      selectPriceString(state),
    );

    selectBook1(state1);
    selectMemoizedPriceString(state1);

    expect(selectAdjustedPriceString(state1)).toBe('10');
    expect(selectAdjustedPriceString(state2)).toBe('0');
  });
});
