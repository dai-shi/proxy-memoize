# useProxySelector
This creates a `useProxySelector` hook which can be used to create a typed `useSelector` hook powered by `proxy-memoize`. By defining this hook in your application code, you can ensure that the `state` object reflects your redux state object.

## The Hook
```ts
import { memoize } from "proxy-memoize";
import { useCallback } from "react";
import { useSelector } from "react-redux";

// import your react-redux RootState type
import type { RootState } from "./path/to/root/state/declaration";

const createProxySelectorHook = <TState extends object = any>() => {
  const useProxySelector = <TReturnType>(
    fn: (state: TState) => TReturnType,
    deps?: any[]
  ): TReturnType => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useSelector(useCallback(memoize(fn), deps));
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

const MyComponent:React.FC<Props> = ({ value }) => {
  const result = useProxySelector((state) => {
    return `${value}-modified`
  }, [value]);
  return (<div>{result}</div>);
}
```
