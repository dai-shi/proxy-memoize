import {
  createProxy,
  isChanged,
  getUntracked,
  trackMemo,
} from 'proxy-compare';

// constants from proxy-compare
const HAS_KEY_PROPERTY = 'h';
const ALL_OWN_KEYS_PROPERTY = 'w';
const HAS_OWN_KEY_PROPERTY = 'o';
const KEYS_PROPERTY = 'k';

type HasKeySet = Set<string | symbol>
type HasOwnKeySet = Set<string | symbol>
type KeysSet = Set<string | symbol>
type Used = {
  [HAS_KEY_PROPERTY]?: HasKeySet;
  [ALL_OWN_KEYS_PROPERTY]?: true;
  [HAS_OWN_KEY_PROPERTY]?: HasOwnKeySet;
  [KEYS_PROPERTY]?: KeysSet;
};
type Affected = WeakMap<object, Used>;

const isObject = (x: unknown): x is object => typeof x === 'object' && x !== null;

const untrack = <T>(x: T, seen: Set<T>): T => {
  if (!isObject(x)) return x;
  const untrackedObj = getUntracked(x);
  if (untrackedObj !== null) {
    trackMemo(x);
    return untrackedObj;
  }
  if (!seen.has(x)) {
    seen.add(x);
    Object.entries(x).forEach(([k, v]) => {
      const vv = untrack(v, seen);
      if (!Object.is(vv, v)) x[k as keyof T] = vv;
    });
  }
  return x;
};

type Touched = WeakMap<object, WeakSet<object>>;

const touchAffected = (
  dst: unknown,
  src: unknown,
  affected: Affected,
  touched: Touched,
) => {
  if (!isObject(dst) || !isObject(src)) return;
  const origSrc = getUntracked(src) || src;
  const used = affected.get(origSrc);
  if (!used) return;
  let touchedDsts = touched.get(origSrc);
  if (!touchedDsts) {
    touchedDsts = new WeakSet();
    touched.set(origSrc, touchedDsts);
  }
  if (touchedDsts.has(dst)) {
    return;
  }
  touchedDsts.add(dst);
  used[HAS_KEY_PROPERTY]?.forEach((key) => {
    Reflect.has(dst, key);
  });
  if (used[ALL_OWN_KEYS_PROPERTY] === true) {
    Reflect.ownKeys(dst);
  }
  used[HAS_OWN_KEY_PROPERTY]?.forEach((key) => {
    Reflect.getOwnPropertyDescriptor(dst, key);
  });
  used[KEYS_PROPERTY]?.forEach((key) => {
    touchAffected(
      dst[key as keyof typeof dst],
      src[key as keyof typeof src],
      affected,
      touched,
    );
  });
};

// properties
const OBJ_PROPERTY = 'o';
const RESULT_PROPERTY = 'r';
const AFFECTED_PROPERTY = 'a';
const TOUCHED_PROPERTY = 't';

/**
 * Create a memoized function
 *
 * @example
 * import { memoize } from 'proxy-memoize';
 *
 * const fn = memoize(obj => ({ sum: obj.a + obj.b, diff: obj.a - obj.b }));
 *
 * @param options
 * @param options.size - (default: 1)
 * @param options.noWeakMap - disable tier-1 cache (default: false)
 */
export function memoize<Obj extends object, Result>(
  fn: (obj: Obj) => Result,
  options?: { size?: number; noWeakMap?: boolean },
): (obj: Obj) => Result {
  let memoListHead = 0;
  const size = options?.size ?? 1;
  type Entry = {
    [OBJ_PROPERTY]: Obj;
    [RESULT_PROPERTY]: Result;
    [AFFECTED_PROPERTY]: Affected;
    [TOUCHED_PROPERTY]: Touched;
  }
  const memoList: Entry[] = [];
  const resultCache = options?.noWeakMap ? null : new WeakMap<Obj, Entry>();
  const proxyCache = new WeakMap();
  const memoizedFn = (obj: Obj) => {
    const cache = resultCache?.get(obj);
    if (cache) {
      touchAffected(obj, cache[OBJ_PROPERTY], cache[AFFECTED_PROPERTY], cache[TOUCHED_PROPERTY]);
      return cache[RESULT_PROPERTY];
    }
    for (let i = 0; i < size; i += 1) {
      const memo = memoList[(memoListHead + i) % size];
      if (!memo) break;
      if (!isChanged(memo[OBJ_PROPERTY], obj, memo[AFFECTED_PROPERTY], new WeakMap())) {
        touchAffected(obj, memo[OBJ_PROPERTY], memo[AFFECTED_PROPERTY], memo[TOUCHED_PROPERTY]);
        resultCache?.set(obj, memo);
        return memo[RESULT_PROPERTY];
      }
    }
    const affected: Affected = new WeakMap();
    const proxy = createProxy(obj, affected, proxyCache);
    const result = untrack(fn(proxy), new Set());
    const touched: Touched = new WeakMap();
    touchAffected(obj, obj, affected, touched);
    const entry: Entry = {
      [OBJ_PROPERTY]: obj,
      [RESULT_PROPERTY]: result,
      [AFFECTED_PROPERTY]: affected,
      [TOUCHED_PROPERTY]: touched,
    };
    memoListHead = (memoListHead - 1 + size) % size;
    memoList[memoListHead] = entry;
    resultCache?.set(obj, entry);
    return result;
  };
  return memoizedFn;
}
