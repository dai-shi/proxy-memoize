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

  it('case 2', () => {
    type State = {
      booksState: {
        booksObject: {
          book1: { shortName: string };
        };
      };
      extendedBooksState: {
        extendedBooksObject: {
          book1: {
            staticProp: string;
            priceString: string;
            book: { shortName: string };
          };
        };
      };
    };

    const state1: State = {
      booksState: {
        booksObject: {
          book1: {
            shortName: 'book1-name',
          },
        },
      },
      extendedBooksState: {
        extendedBooksObject: {
          book1: {
            staticProp: '5',
            priceString: '10',
            book: {
              shortName: 'book1-name',
            },
          },
        },
      },
    };

    const state2: State = {
      booksState: {
        booksObject: {
          book1: {
            shortName: 'book1-name',
          },
        },
      },
      extendedBooksState: {
        extendedBooksObject: {
          book1: {
            staticProp: '5',
            priceString: '0',
            book: {
              shortName: 'book1-name',
            },
          },
        },
      },
    };

    const selectPriceString = memoize(
      (state: State) =>
        state.extendedBooksState.extendedBooksObject.book1.priceString,
    );

    const selectAdjustedPriceString = memoize((state: State) => {
      const {
        booksState: { booksObject },
        extendedBooksState: { extendedBooksObject },
      } = state;

      const book = booksObject.book1;

      book.shortName; // touch the prop

      const priceString = selectPriceString(state);

      extendedBooksObject.book1.staticProp; // touch the prop

      return priceString;
    });

    const selectAllExtendedBooks = memoize((state: State) =>
      Object.values(state.extendedBooksState.extendedBooksObject),
    );

    const selectBookThroughExtendedBooks = memoize(
      (state: State) => selectAllExtendedBooks(state)[0]!.book,
    );

    const selectMemoizedPriceString = memoize(
      (state: State) => selectPriceString(state),
    );

    const getPriceStringSelector =
      (
        _book: unknown, // looks as touch
      ) =>
      (state: State) =>
        selectMemoizedPriceString(state);

    getPriceStringSelector(selectBookThroughExtendedBooks(state1))(state1);
    expect(selectAdjustedPriceString(state1)).toBe('10');

    getPriceStringSelector(selectBookThroughExtendedBooks(state2))(state2);
    expect(selectAdjustedPriceString(state2)).toBe('0');
  });
});
