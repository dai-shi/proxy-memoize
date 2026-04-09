# useProxySelector

This creates a `useProxySelector` hook which can be used to create a typed `useSelector` hook powered by `proxy-memoize`. By defining this hook in your application code, you can ensure that the `state` object reflects your redux state object.

## The Hook

```ts
import { memoize } from 'proxy-memoize';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

// import your react-redux RootState type
import type { RootState } from './path/to/root/state/declaration';

const createProxySelectorHook = <TState extends object>() => {
  const useTypedSelector = useSelector.withTypes<TState>();

  const useProxySelector = <TReturnType>(
    fn: (state: TState) => TReturnType,
    deps: React.DependencyList = [],
  ): TReturnType => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const selector = useMemo(() => memoize(fn), deps);
    return useTypedSelector(selector);
  };

  return useProxySelector;
};

// export
export const useProxySelector = createProxySelectorHook<RootState>();
```

## Usage in Code

```tsx
interface Props {
  value: string;
}

const MyComponent: React.FC<Props> = ({ value }) => {
  const result = useProxySelector(
    (state) => {
      return `${value}-modified`;
    },
    [value],
  );
  return <div>{result}</div>;
};
```
