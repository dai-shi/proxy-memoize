import { describe, expect, it } from 'vitest';
import { memoize } from 'proxy-memoize';

describe('same object reached by different paths (#114)', () => {
  const a = { id: 1 };
  const b = { id: 2 };
  type State = {
    list: { id: number }[];
    selected: { id: number };
    current: { id: number };
    other: { id: number };
  };
  const state: State = { list: [a, b], selected: b, current: a, other: a };

  it('should find an object in an array', () => {
    const indexOfSelected = (s: State) => s.list.indexOf(s.selected);
    expect(memoize(indexOfSelected)(state)).toBe(indexOfSelected(state));
    expect(memoize(indexOfSelected)(state)).toBe(1);
  });

  it('should compare the same object with ===', () => {
    const isSame = (s: State) => s.current === s.other;
    expect(memoize(isSame)(state)).toBe(true);
  });

  it('should keep the result in sync after the state changes', () => {
    const indexOfSelected = memoize((s: State) => s.list.indexOf(s.selected));
    expect(indexOfSelected(state)).toBe(1);
    expect(indexOfSelected({ ...state, selected: a })).toBe(0);
    expect(indexOfSelected({ ...state, selected: { id: 2 } })).toBe(-1);
    const c = { id: 3 };
    expect(indexOfSelected({ ...state, list: [a, b, c], selected: c })).toBe(2);
  });
});
