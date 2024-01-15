import { memoize } from '../src/index';

describe('no extra calculations (#91)', () => {
  it('nested memoized selectors with primitive value access', () => {
    const reduxState = {
      books: {
        bookByName: {
          bookPrice1: 50,
          bookPrice2: 100,
        },
      },
    };
    let selectAllBooksCount = 0;
    const selectAllBooks = memoize((state: typeof reduxState) => {
      selectAllBooksCount += 1;
      return Object.values(state.books.bookByName);
    });
    const selectSomeBooks = memoize((state: typeof reduxState) => {
      const someBooks = selectAllBooks(state);
      return someBooks.filter((price) => price === 100);
    });
    const selectBooks = memoize((state: typeof reduxState) => {
      const allBooks = selectAllBooks(state);
      const someBooks = selectSomeBooks(state);
      return { allBooks, someBooks };
    });
    selectBooks(reduxState);
    expect(selectAllBooksCount).toBe(1);
  });

  it('nested memoized selectors with object access', () => {
    const reduxState = {
      books: {
        bookByName: {
          book1: { price: 50 },
          book2: { price: 100 },
        },
      },
    };
    let selectAllBooksCount = 0;
    const selectAllBooks = memoize((state: typeof reduxState) => {
      selectAllBooksCount += 1;
      return Object.values(state.books.bookByName);
    });
    const selectSomeBooks = memoize((state: typeof reduxState) => {
      const someBooks = selectAllBooks(state);
      return someBooks.filter((book) => book.price === 100);
    });
    const selectBooks = memoize((state: typeof reduxState) => {
      const allBooks = selectAllBooks(state);
      const someBooks = selectSomeBooks(state);
      return { allBooks, someBooks };
    });
    selectBooks(reduxState);
    expect(selectAllBooksCount).toBe(1);
  });
});
