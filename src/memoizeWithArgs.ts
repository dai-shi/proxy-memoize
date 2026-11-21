import { memoize } from './memoize.js';

type Options = Omit<NonNullable<Parameters<typeof memoize>[1]>, 'noWeakMap'>;

// Spreading the args reads every index, so an object argument the function
// never reads would be compared by identity and miss the cache (#109).
// Checking a private symbol records the argument as used without depending
// on any of its keys; reading it as a whole still compares it by identity.
const ARG_SYMBOL = Symbol();

/**
 * Create a memoized function with args
 *
 * @example
 * import { memoizeWithArgs } from 'proxy-memoize';
 *
 * const fn = memoizeWithArgs((a, b) => ({ sum: a.v + b.v, diff: a.v - b.v }));
 *
 * @param options
 * @param options.size - (default: 1)
 */
export const memoizeWithArgs = <Args extends unknown[], Result>(
  fnWithArgs: (...args: Args) => Result,
  options?: Options,
) => {
  const fn = memoize(
    (args: Args) => {
      for (let i = 0; i < args.length; i += 1) {
        const arg = args[i];
        if (typeof arg === 'object' && arg !== null) {
          Reflect.has(arg, ARG_SYMBOL);
        }
      }
      return fnWithArgs(...args);
    },
    {
      ...options,
      noWeakMap: true,
    },
  );
  return (...args: Args) => fn(args);
};
