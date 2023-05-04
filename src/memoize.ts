import {
  createProxy,
  isChanged,
  getUntracked,
  trackMemo,
} from 'proxy-compare';

// This is required only for performance.
// https://github.com/dai-shi/proxy-memoize/issues/68
const targetCache = new WeakMap();

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

const touchAffected = (dst: unknown, src: unknown, affected: Affected) => {
  if (!isObject(dst) || !isObject(src)) return;
  const used = affected.get(getUntracked(src) || src);
  if (!used) return;
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
    );
  });
};

// properties
const OBJ_PROPERTY = 'o';
const RESULT_PROPERTY = 'r';
const AFFECTED_PROPERTY = 'a';

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
  }
  const memoList: Entry[] = [];
  const resultCache = options?.noWeakMap ? null : new WeakMap<Obj, Entry>();
  const memoizedFn = (obj: Obj) => {
    const cache = resultCache?.get(obj);
    if (cache) {
      return cache[RESULT_PROPERTY];
    }
    for (let i = 0; i < size; i += 1) {
      const memo = memoList[(memoListHead + i) % size];
      if (!memo) break;
      if (!isChanged(memo[OBJ_PROPERTY], obj, memo[AFFECTED_PROPERTY], new WeakMap())) {
        touchAffected(obj, memo[OBJ_PROPERTY], memo[AFFECTED_PROPERTY]);
        resultCache?.set(obj, memo);
        return memo[RESULT_PROPERTY];
      }
    }
    const affected: Affected = new WeakMap();
    const proxy = createProxy(obj, affected, undefined, targetCache);
    const result = untrack(fn(proxy), new Set());
    touchAffected(obj, obj, affected);
    const entry: Entry = {
      [OBJ_PROPERTY]: obj,
      [RESULT_PROPERTY]: result,
      [AFFECTED_PROPERTY]: affected,
    };
    memoListHead = (memoListHead - 1 + size) % size;
    memoList[memoListHead] = entry;
    resultCache?.set(obj, entry);
    return result;
  };
  return memoizedFn;
}
