import {
  createDeepProxy,
  isDeepChanged,
  getUntrackedObject,
  trackMemo,
} from 'proxy-compare';

const untrack = <T>(x: T, seen: Set<T>): T => {
  if (typeof x !== 'object' || x === null) return x;
  const untrackedObj = getUntrackedObject(x);
  if (untrackedObj !== null) return untrackedObj;
  if (!seen.has(x)) {
    seen.add(x);
    Object.entries(x).forEach(([k, v]) => {
      const vv = untrack(v, seen);
      if (!Object.is(vv, v)) x[k as keyof T] = vv;
    });
  }
  return x;
};

// properties
const OBJ_PROPERTY = 'o';
const RESULT_PROPERTY = 'r';
const AFFECTED_PROPERTY = 'a';

/**
 * create a memoized function
 *
 * @example
 * import memoize from 'proxy-memoize';
 *
 * const fn = memoize(obj => ({ sum: obj.a + obj.b, diff: obj.a - obj.b }));
 */
const memoize = <Obj extends object, Result>(
  fn: (obj: Obj) => Result,
  options?: { size?: number },
): (obj: Obj) => Result => {
  const size = options?.size ?? 1;
  const memoList: {
    [OBJ_PROPERTY]: Obj;
    [RESULT_PROPERTY]: Result;
    [AFFECTED_PROPERTY]: WeakMap<object, unknown>;
  }[] = [];
  const resultCache = new WeakMap<Obj, Result>();
  const proxyCache = new WeakMap();
  const memoizedFn = (obj: Obj) => {
    if (resultCache.has(obj)) return resultCache.get(obj) as Result;
    for (let i = 0; i < memoList.length; i += 1) {
      const memo = memoList[i];
      if (!isDeepChanged(memo[OBJ_PROPERTY], obj, memo[AFFECTED_PROPERTY], proxyCache)) {
        resultCache.set(obj, memo[RESULT_PROPERTY]);
        return memo[RESULT_PROPERTY];
      }
    }
    trackMemo(obj);
    const affected = new WeakMap<object, unknown>();
    const proxy = createDeepProxy(obj, affected, proxyCache);
    const result = untrack(fn(proxy), new Set());
    memoList.unshift({
      [OBJ_PROPERTY]: obj,
      [RESULT_PROPERTY]: result,
      [AFFECTED_PROPERTY]: affected,
    });
    if (memoList.length > size) memoList.pop();
    resultCache.set(obj, result);
    return result;
  };
  return memoizedFn;
};

export default memoize;
