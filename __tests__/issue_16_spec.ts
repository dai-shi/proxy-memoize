import { memoize } from '../src/index';

describe('issue #16', () => {
  it('slimmed test', () => {
    type State = Record<string, number>;

    const firstState: State = {
      a: 10,
      b: 20,
    };

    const spy = jest.fn();

    const selector = memoize(
      ({ state, orderId }: { state: State; orderId: string }) => {
        spy();
        return { amount: state[orderId] };
      },
      { size: 50 },
    );

    const result = selector({ state: firstState, orderId: 'a' });
    expect(result === selector({ state: firstState, orderId: 'a' })).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);

    const otherResult = selector({ state: firstState, orderId: 'b' });

    expect(result === selector({ state: firstState, orderId: 'a' })).toBe(true);
    expect(spy).toHaveBeenCalledTimes(2);

    const secondState: State = {
      ...firstState,
      c: 30,
    };

    expect(selector({ state: secondState, orderId: 'a' }) === result).toBe(true);
    expect(spy).toHaveBeenCalledTimes(2);

    const thirdState: State = {
      ...secondState,
      a: 40,
    };

    const newResult = selector({ state: thirdState, orderId: 'a' });
    expect(newResult).toEqual({ amount: 40 });
    expect(newResult === result).toBe(false);
    expect(spy).toHaveBeenCalledTimes(3);

    expect(selector({ state: thirdState, orderId: 'b' }) === otherResult).toBe(true);
  });

  it('receipt use case', () => {
    // https://codesandbox.io/s/pedantic-rubin-2g8i1?file=/src/proxy-memoize.test.ts

    interface ReceiptType {
      orderId: number;
      amount: number;
    }

    interface StateType {
      receipts: Record<number, ReceiptType>;
    }

    const spy = jest.fn();

    function getAmount(receipt: ReceiptType) {
      // call the spy without using receipt, just in case
      // that would cause Proxy-reading issues
      spy();
      return receipt.amount;
    }

    const selector = memoize(
      ({ state, orderId }: { state: StateType; orderId: number }) => ({
        amount: getAmount(state.receipts[orderId] as ReceiptType),
      }),
      { size: 50 }, // for safety
    );

    const state: StateType = {
      receipts: {
        5: {
          orderId: 5,
          amount: 10,
        },
        6: {
          orderId: 6,
          amount: 20,
        },
      },
    };

    const result = selector({ state, orderId: 5 });
    expect(result === selector({ state, orderId: 5 })).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);

    // Save the selector result of 6, for later.
    const otherResult = selector({ state, orderId: 6 });
    // confirm that memoization works if we called the selector with
    // a different orderId
    expect(result === selector({ state, orderId: 5 })).toBe(true);
    expect(spy).toHaveBeenCalledTimes(2);

    const secondState: StateType = {
      ...state,
      receipts: {
        ...state.receipts,
        7: {
          orderId: 7,
          amount: 30,
        },
      },
    };

    // expect(secondState === state).toBe(false);

    // We're using a new state object, but since `5` wasn't changed, we expect
    // not to re-calculate
    expect(selector({ state: secondState, orderId: 5 }) === result).toBe(true);
    expect(spy).toHaveBeenCalledTimes(2);

    const thirdState: StateType = {
      ...secondState,
      receipts: {
        ...secondState.receipts,
        5: {
          ...(secondState.receipts[5] as ReceiptType),
          amount: 40,
        },
      },
    };

    // We're using a new state object, and since `5` was changed, we expect
    // that we should re-calculate
    const newResult = selector({ state: thirdState, orderId: 5 });

    // Now that 5 has changed, we should get a re-calculation, but this
    // ends up being an error that `newResult` is `{ amount: 10 }`
    expect(newResult).toEqual({ amount: 40 });
    expect(newResult === result).toBe(false);
    expect(spy).toHaveBeenCalledTimes(3);

    // Re-check 6 with a state which has changed twice, but not for 6.
    expect(selector({ state: thirdState, orderId: 6 }) === otherResult).toBe(true);
  });
});
