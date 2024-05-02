export { memoize } from './memoize.js';
export { memoizeWithArgs } from './memoizeWithArgs.js';

/**
 * This is to unwrap a proxy object and return an original object.
 * It returns null if not relevant.
 *
 * [Notes]
 * This function is for debugging purpose.
 * It's not supposed to be used in production and it's subject to change.
 *
 * @example
 * import { memoize, getUntracked } from 'proxy-memoize';
 *
 * const fn = memoize(obj => {
 *   console.log(getUntracked(obj));
 *   return { sum: obj.a + obj.b, diff: obj.a - obj.b };
 * });
 */
export { getUntracked } from 'proxy-compare';

/**
 * This is to replace newProxy function in upstream library, proxy-compare.
 * Use it at your own risk.
 *
 * [Notes]
 * See related discussoin: https://github.com/dai-shi/proxy-compare/issues/40
 */
export { replaceNewProxy } from 'proxy-compare';
