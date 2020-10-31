import {
  createDeepProxy,
  isDeepChanged,
  getUntrackedObject,
} from 'proxy-compare';

type Affected = WeakMap<object, Set<string | number | symbol>>;

const isObject = (x: unknown): x is object => typeof x === 'object' && x !== null;

/*
const affectedToPathList = (rootObj: object, affected: Affected) => {
  const list: (string | number | symbol)[][] = [];
  const walk = (obj: object, path?: (string | number | symbol)[]) => {
    const used = affected.get(obj);
    if (used) {
      used.forEach((key) => {
        walk(obj[key as keyof typeof obj], path ? [...path, key] : [key]);
      });
    } else if (path) {
      list.push(path);
    }
  };
  walk(rootObj);
  return list;
};
*/

const untrack = <T>(x: T, seen: Set<T>): T => {
  if (!isObject(x)) return x;
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

const getDeepUntrackedObject = <Obj extends object>(obj: Obj): Obj => {
  const untrackedObj = getUntrackedObject(obj);
  if (untrackedObj === null) return obj;
  return getDeepUntrackedObject(untrackedObj);
};

const copyAffected = (orig: unknown, x: unknown, affected: Affected) => {
  if (!isObject(orig) || !isObject(x)) return;
  const used = affected.get(x);
  if (!used) return;
  affected.set(orig, used);
  used.forEach((key) => {
    copyAffected(
      orig[key as keyof typeof orig],
      x[key as keyof typeof x],
      affected,
    );
  });
};

const touchAffected = (x: unknown, orig: unknown, affected: Affected) => {
  if (!isObject(x) || !isObject(orig)) return;
  const used = affected.get(orig);
  if (!used) return;
  used.forEach((key) => {
    touchAffected(
      x[key as keyof typeof x],
      orig[key as keyof typeof orig],
      affected,
    );
  });
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
    [AFFECTED_PROPERTY]: Affected;
  }[] = [];
  const resultCache = new WeakMap<Obj, {
    [RESULT_PROPERTY]: Result;
    [AFFECTED_PROPERTY]: Affected;
  }>();
  const proxyCache = new WeakMap();
  const memoizedFn = (obj: Obj) => {
    const cacheKey = getDeepUntrackedObject(obj);
    const cache = resultCache.get(cacheKey);
    if (cache) {
      touchAffected(obj, cacheKey, cache[AFFECTED_PROPERTY]);
      return cache[RESULT_PROPERTY];
    }
    for (let i = 0; i < memoList.length; i += 1) {
      const memo = memoList[i];
      if (!isDeepChanged(memo[OBJ_PROPERTY], obj, memo[AFFECTED_PROPERTY], proxyCache)) {
        resultCache.set(cacheKey, {
          [RESULT_PROPERTY]: memo[RESULT_PROPERTY],
          [AFFECTED_PROPERTY]: memo[AFFECTED_PROPERTY],
        });
        touchAffected(obj, cacheKey, memo[AFFECTED_PROPERTY]);
        return memo[RESULT_PROPERTY];
      }
    }
    const affected: Affected = new WeakMap();
    const proxy = createDeepProxy(obj, affected, proxyCache);
    const result = untrack(fn(proxy), new Set());
    if (obj !== cacheKey) {
      const origObj = getUntrackedObject(obj);
      if (cacheKey !== origObj) {
        copyAffected(cacheKey, origObj, affected);
      }
      touchAffected(obj, cacheKey, affected);
    }
    memoList.unshift({
      [OBJ_PROPERTY]: obj,
      [RESULT_PROPERTY]: result,
      [AFFECTED_PROPERTY]: affected,
    });
    if (memoList.length > size) memoList.pop();
    resultCache.set(cacheKey, {
      [RESULT_PROPERTY]: result,
      [AFFECTED_PROPERTY]: affected,
    });
    return result;
  };
  return memoizedFn;
};

export default memoize;
