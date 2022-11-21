import {
  createProxy,
  isChanged,
  getUntracked,
  trackMemo,
} from 'proxy-compare';

type Affected = WeakMap<object, Set<string | number | symbol>>;

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
  used.forEach((key) => {
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
 * import memoize from 'proxy-memoize';
 *
 * const fn = memoize(obj => ({ sum: obj.a + obj.b, diff: obj.a - obj.b }));
 *
 * @param options
 * @param options.size - (default: 1)
 * @param options.noWeakMap - disable tier-1 cache (default: false)
 */
const memoize = <Obj extends object, Result>(
  fn: (obj: Obj) => Result,
  options?: { size?: number; noWeakMap?: boolean },
): (obj: Obj) => Result => {
  let memoListHead = 0;
  const size = options?.size ?? 1;
  type Entry = {
    [OBJ_PROPERTY]: Obj;
    [RESULT_PROPERTY]: Result;
    [AFFECTED_PROPERTY]: Affected;
  }
  const memoList: Entry[] = [];
  const resultCache = options?.noWeakMap ? null : new WeakMap<Obj, Entry>();
  const proxyCache = new WeakMap();
  const memoizedFn = (obj: Obj) => {
    const cacheKey = getUntracked(obj) || obj;
    const cache = resultCache?.get(cacheKey);
    if (cache) {
      touchAffected(obj, cache[OBJ_PROPERTY], cache[AFFECTED_PROPERTY]);
      return cache[RESULT_PROPERTY];
    }
    for (let i = 0; i < size; i += 1) {
      const memo = memoList[(memoListHead + i) % size];
      if (!memo) break;
      if (!isChanged(memo[OBJ_PROPERTY], obj, memo[AFFECTED_PROPERTY], new WeakMap())) {
        resultCache?.set(cacheKey, memo);
        touchAffected(obj, memo[OBJ_PROPERTY], memo[AFFECTED_PROPERTY]);
        return memo[RESULT_PROPERTY];
      }
    }
    const affected: Affected = new WeakMap();
    const proxy = createProxy(obj, affected, proxyCache);
    const result = untrack(fn(proxy), new Set());
    touchAffected(obj, obj, affected);
    const entry: Entry = {
      [OBJ_PROPERTY]: obj,
      [RESULT_PROPERTY]: result,
      [AFFECTED_PROPERTY]: affected,
    };
    memoListHead = (memoListHead - 1 + size) % size;
    memoList[memoListHead] = entry;
    resultCache?.set(cacheKey, entry);
    return result;
  };
  return memoizedFn;
};

/**
 * This is to unwrap a proxy object and return an original object.
 * It returns null if not relevant.
 *
 * [Notes]
 * This function is for debugging purpose.
 * It's not supposed to be used in production and it's subject to change.
 *
 * @example
 * import memoize, { getUntrackedObject } from 'proxy-memoize';
 *
 * const fn = memoize(obj => {
 *   console.log(getUntrackedObject(obj));
 *   return { sum: obj.a + obj.b, diff: obj.a - obj.b };
 * });
 */
export { getUntracked as getUntrackedObject } from 'proxy-compare';

/**
 * This is to replace newProxy function in upstream library, proxy-compare.
 * Use it at your own risk.
 *
 * [Notes]
 * See related discussoin: https://github.com/dai-shi/proxy-compare/issues/40
 */
export { replaceNewProxy } from 'proxy-compare';

export default memoize;
