import {
  createDeepProxy,
  isDeepChanged,
  getUntrackedObject,
} from 'proxy-compare';

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
    const affected = new WeakMap<object, unknown>();
    const proxy = createDeepProxy(obj, affected, proxyCache);
    const result = untrack(fn(proxy));
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

const untrack = <T>(x: T): T => {
  if (typeof x !== 'object' || x === null) return x;
  const untrackedObj = getUntrackedObject(x);
  if (untrackedObj !== null) return untrackedObj;
  if (Array.isArray(x)) untrackArray(x);
  return untrackObj(x as unknown as object) as unknown as T;
};

const untrackArray = <Arr extends unknown[]>(arr: Arr): Arr => {
  const newArr = [] as unknown[] as Arr;
  let modified = false;
  arr.forEach((v, i) => {
    newArr[i] = untrack(v);
    if (v !== null && newArr[i] !== null) {
      modified = true;
    } else {
      newArr[i] = v;
    }
  });
  return modified ? newArr : arr;
};

const untrackObj = <Obj extends object>(obj: Obj): Obj => {
  const newObj = {} as Obj;
  let modified = false;
  Object.entries(obj).forEach(([k, v]) => {
    newObj[k as keyof Obj] = untrack(v);
    if (v !== null && newObj[k as keyof Obj] !== null) {
      modified = true;
    } else {
      newObj[k as keyof Obj] = v;
    }
  });
  return modified ? newObj : obj;
};

export default memoize;
