# proxy-memoize

[![CI](https://img.shields.io/github/actions/workflow/status/dai-shi/proxy-memoize/ci.yml?branch=main)](https://github.com/dai-shi/proxy-memoize/actions?query=workflow%3ACI)
[![npm](https://img.shields.io/npm/v/proxy-memoize)](https://www.npmjs.com/package/proxy-memoize)
[![size](https://img.shields.io/bundlephobia/minzip/proxy-memoize)](https://bundlephobia.com/result?p=proxy-memoize)
[![discord](https://img.shields.io/discord/627656437971288081)](https://discord.gg/MrQdmzd)

Intuitive magical memoization library with Proxy and WeakMap

## Project status

The feature has been pretty stable in v1.
In v2, we added some new capabilities.
Our docs and examples are not very comprehensive,
and we hope to have more best practices.
Contributions are welcome.

## Introduction

Immutability is pivotal in more than a few frameworks, like React and Redux. It enables simple-yet-efficient change detection in large nested data structures.

JavaScript is a mutable language by default. Libraries like [immer](https://github.com/immerjs/immer) simplify *updating* immutable data strucutres.

This library helps *deriving data* from immutable structures (AKA, selectors), efficiantly caching results for faster performance.

This library utilizes Proxy and WeakMap, and provides memoization.
The memoized function will re-evaluate the original function
only if the used part of argument (object) is changed.
It's intuitive in a sense and magical in another sense.

## How it works

When it (re-)evaluates a function,
it will wrap an input object with proxies (recursively, on demand)
and invoke the function.
When it's finished it will check what is "affected".
The "affected" is a list of paths of the input object
that are accessed during the function invocation.

Next time when it receives a new input object,
it will check if values in "affected" paths are changed.
If so, it will re-evaluate the function.
Otherwise, it will return a cached result.

The cache size is `1` by default, but configurable.

We have 2-tier cache mechanism.
What is described so far is the second tier cache.

The first tier cache is with WeakMap.
It's a WeakMap of the input object and the result of function invocation.
There's no notion of cache size.

In summary, there are two types of cache:

*   tier-1: WeakMap based cache (size=infinity)
*   tier-2: Proxy based cache (size=1, configurable)

## Install

```bash
npm install proxy-memoize
```

## How it behaves

```js
import { memoize } from 'proxy-memoize';

const fn = memoize(x => ({ sum: x.a + x.b, diff: x.a - x.b }));

fn({ a: 2, b: 1, c: 1 }); // ---> { sum: 3, diff: 1 }
fn({ a: 3, b: 1, c: 1 }); // ---> { sum: 4, diff: 2 }
fn({ a: 3, b: 1, c: 9 }); // ---> { sum: 4, diff: 2 } (returning a cached value)
fn({ a: 4, b: 1, c: 9 }); // ---> { sum: 5, diff: 3 }

fn({ a: 1, b: 2 }) === fn({ a: 1, b: 2 }); // ---> true
```

## Usage with React Context

Instead of bare useMemo.

```jsx
const Component = (props) => {
  const [state, dispatch] = useContext(MyContext);
  const render = useCallback(memoize(([props, state]) => (
    <div>
      {/* render with props and state */}
    </div>
  )), [dispatch]);
  return render([props, state]);
};

const App = ({ children }) => (
  <MyContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </MyContext.Provider>
);
```

*   [CodeSandbox](https://codesandbox.io/s/proxy-memoize-demo-vrnze)

## Usage with React Redux & Reselect

Instead of [reselect](https://github.com/reduxjs/reselect).

```jsx
import { useSelector } from 'react-redux';

const getScore = memoize(state => ({
  score: heavyComputation(state.a + state.b),
  createdAt: Date.now(),
}));

const Component = ({ id }) => {
  const { score, title } = useSelector(useCallback(memoize(state => ({
    score: getScore(state),
    title: state.titles[id],
  })), [id]));
  return <div>{score.score} {score.createdAt} {title}</div>;
};
```

*   [CodeSandbox 1](https://codesandbox.io/s/proxy-memoize-demo-c1021)
*   [CodeSandbox 2](https://codesandbox.io/s/proxy-memoize-demo-fi5ni)
*   [Hooks & Recipes](docs/react-redux)

### Using `size` option

The example above might seem tricky to create memoized selector in component.
Alternatively, we can use `size` option.

```jsx
import { useSelector } from 'react-redux';

const getScore = memoize(state => ({
  score: heavyComputation(state.a + state.b),
  createdAt: Date.now(),
}));

const selector = memoize(([state, id]) => ({
  score: getScore(state),
  title: state.titles[id],
}), {
  size: 500,
});

const Component = ({ id }) => {
  const { score, title } = useSelector(state => selector([state, id]));
  return <div>{score.score} {score.createdAt} {title}</div>;
};
```

The drawback of this approach is we need a good estimate of `size` in advance.

## Usage with Zustand

For derived values.

```jsx
import { create } from 'zustand';

const useStore = create(set => ({
  valueA,
  valueB,
  // ...
}));

const getDerivedValueA = memoize(state => heavyComputation(state.valueA))
const getDerivedValueB = memoize(state => heavyComputation(state.valueB))
const getTotal = state => getDerivedValueA(state) + getDerivedValueB(state)

const Component = () => {
  const total = useStore(getTotal)
  return <div>{total}</div>;
};
```

*   [CodeSandbox](https://codesandbox.io/s/proxy-memoize-demo-yo00p)

## Usage with immer

Disabling auto freeze is recommended. JavaScript does not support nested proxies of frozen objects.

```js
import { setAutoFreeze } from 'immer';
setAutoFreeze(false);
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### getUntracked

This is to unwrap a proxy object and return an original object.
It returns null if not relevant.

\[Notes]
This function is for debugging purpose.
It's not supposed to be used in production and it's subject to change.

#### Examples

```javascript
import { memoize, getUntracked } from 'proxy-memoize';

const fn = memoize(obj => {
  console.log(getUntracked(obj));
  return { sum: obj.a + obj.b, diff: obj.a - obj.b };
});
```

### replaceNewProxy

This is to replace newProxy function in upstream library, proxy-compare.
Use it at your own risk.

\[Notes]
See related discussoin: <https://github.com/dai-shi/proxy-compare/issues/40>

### memoize

Create a memoized function

#### Parameters

*   `fn` **function (obj: Obj): Result**&#x20;
*   `options` **{size: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?, noWeakMap: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?}?**&#x20;

    *   `options.size`  (default: 1)
    *   `options.noWeakMap`  disable tier-1 cache (default: false)

#### Examples

```javascript
import { memoize } from 'proxy-memoize';

const fn = memoize(obj => ({ sum: obj.a + obj.b, diff: obj.a - obj.b }));
```

Returns **function (obj: Obj): Result**&#x20;

### memoizeWithArgs

Create a memoized function with args

#### Parameters

*   `fnWithArgs` **function (...args: Args): Result**&#x20;
*   `options` **Options?**&#x20;

    *   `options.size`  (default: 1)

#### Examples

```javascript
import { memoizeWithArgs } from 'proxy-memoize';

const fn = memoizeWithArgs((a, b) => ({ sum: a.v + b.v, diff: a.v - b.v }));
```

## Limitations and workarounds

### Inside the function, objects are wrapped with proxies and touching a property will record it.

```js
const fn = memoize(obj => {
  console.log(obj.c); // this will mark ".c" as used
  return { sum: obj.a + obj.b, diff: obj.a - obj.b };
});
```

A workaround is to unwrap a proxy.

```js
const fn = memoize(obj => {
  console.log(getUntracked(obj).c);
  return { sum: obj.a + obj.b, diff: obj.a - obj.b };
});
```

### Memoized function will unwrap proxies in the return value only if it consists of plain objects/arrays.

```js
const fn = memoize(obj => {
  return { x: obj.a, y: { z: [obj.b, obj.c] } }; // plain objects
});
```

In this case above, the return value is clean, however, see the following.

```js
const fn = memoize(obj => {
  return { x: new Set([obj.a]), y: new Map([['z', obj.b]]) }; // not plain
});
```

We can't unwrap Set/Map or other non-plain objects.
The problem is when `obj.a` is an object (which will be wrapped with a proxy)
and touching its property will record the usage, which leads
unexpected behavior.
If `obj.a` is a primitive value, there's no problem.

There's no workaround.
Please be advised to use only plain objects/arrays.
Nested objects/arrays are OK.

### Input object must not be mutated

```js
const fn = memoize(obj => {
  return { sum: obj.a + obj.b, diff: obj.a - obj.b };
});

const state = { a: 1, b: 2 };
const result1 = fn(state);
state.a += 1; // Don't do this, the state object must be immutable
const result2 = fn(state); // Ends up unexpected result
```

The input `obj` or the `state` must be immutable.
The whole concept is built around the immutability.
It's faily common in Redux and React,
but be careful if you are not familiar with the concept.

There's no workaround.

### Input can just be one object

```js
const fn = memoize(obj => {
  return { sum: obj.a + obj.b, diff: obj.a - obj.b };
});
```

The input `obj` is the only argument that a function can receive.

```js
const fn = memoize((arg1, arg2) => {
  // arg2 can't be used
  // ...
});
```

A workaround is to use `memoizeWithArgs` util.

Note: this disables the tier-1 cache with WeakMap.

## Comparison

### Reselect

At a basic level, memoize can be substituted in for `createSelector`. Doing
so will return a selector function with proxy-memoize's built-in tracking
of your state object.

```ts
// reselect
// selecting values from the state object requires composing multiple functions
const mySelector = createSelector(
  state => state.values.value1,
  state => state.values.value2,
  (value1, value2) => value1 + value2,
);

// ----------------------------------------------------------------------

// proxy-memoize
// the same selector can now be written as a single memoized function
const mySelector = memoize(
  state => state.values.value1 + state.values.value2,
);
```

With complex state objects, the ability to track individual properties
within `state` means that proxy-memoize will only calculate a new
value *if and only if* the tracked property changes.

```ts
const state = {
  todos: [{ text: 'foo', completed: false }]
};

// reselect
// If the .completed property changes inside state, the selector must be recalculated
// even through none of the properties we care about changed. In react-redux, this
// selector will result in additional UI re-renders or the developer to implement
// selectorOptions.memoizeOptions.resultEqualityCheck
createSelector(
  state => state.todos,
  todos => todos.map(todo => todo.text)
);

// ----------------------------------------------------------------------

// proxy-memozie
// If the .completed property changes inside state, the selector does NOT change
// this is because we track only the accessed property (todos.text) and can ignore
// the unrelated change
const todoTextsSelector = memoize(state => state.todos.map(todo => todo.text));
```

## Related projects

proxy-memoize depends on an internal library [proxy-compare](https://github.com/dai-shi/proxy-compare).
`react-tracked` and `valtio` are libraries that depend on the same library.

*   [react-tracked](https://github.com/dai-shi/react-tracked)
*   [valtio](https://github.com/pmndrs/valtio)

`memoize-state` provides a similar API for the same goal.

*   [memoize-state](https://github.com/theKashey/memoize-state)
