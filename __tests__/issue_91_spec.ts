import { memoize } from '../src/index';

describe('issue #91', () => {
  it('result cache with nested memoized selectors', () => {
    const reduxState = {
      books: {
        bookByName: {
          book1: {
            price: 50,
          },
          book2: {
            price: 100,
          },
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
      return {
        allBooks,
        someBooks,
      };
    });
    selectBooks(reduxState);
    expect(selectAllBooksCount).toBe(1);
  });
});
