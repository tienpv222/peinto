import { SYMBOL_OBSERVABLE, SYMBOL_OBSERVABLE_WRITABLE } from "oby";
import { $, $$, useEffect, useResolved } from "voby";
import { Component, ComponentFunction, FunctionMaybe } from "voby/dist/types";
import { isFunction, JoinAfter, Nullable } from "./common";

/** TYPES */

export type { Component };

export type ComponentProps<T> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T]
  : T extends ComponentFunction<infer P>
  ? P
  : {};

export type PolyProps<T, P0 = {}, P1 = {}, P2 = {}> = JoinAfter<
  Partial<ComponentProps<T>>,
  P0,
  P1,
  P2,
  Partial<{
    as: T;
    ref: JSX.Refs<HTMLElement>;
    style: Nullable<JSX.StyleProperties>;
    children: JSX.Element;
  }>
>;

export type Control<T = unknown> = (value?: T) => T;
export type ControlMaybe<T = unknown> = T | Control<T>;

export type ResolvedFunctionMaybeArray<T> = T extends [
  FunctionMaybe<infer U>,
  ...infer V
]
  ? [U, ...ResolvedFunctionMaybeArray<V>]
  : [];

/** VARS */

const SYMBOL_UNSET = Symbol();

/** METHODS */

export const control = <T>(value: ControlMaybe<T>): Control<T> => {
  return !isFunction(value)
    ? $(value)
    : !value.length ||
      !(SYMBOL_OBSERVABLE in value) ||
      !(SYMBOL_OBSERVABLE_WRITABLE in value)
    ? $($$(value))
    : value;
};

export const joinRefs = (
  ref: JSX.Ref<HTMLElement>,
  refs: JSX.Refs<HTMLElement>
) => {
  return [ref, refs].flat();
};

export const joinStyles = (
  style1: Nullable<JSX.StyleProperties>,
  style2: Nullable<JSX.StyleProperties>
) => {
  return { ...style1, ...style2 };
};

/** HOOKS */

export function useTransform<T, V extends FunctionMaybe[]>(
  control: Control<T>,
  transform: (value: T, ...deps: ResolvedFunctionMaybeArray<V>) => T,
  ...dependencies: V
) {
  let valuePrev = SYMBOL_UNSET as T;
  let depsPrev = [] as any;

  useEffect(() => {
    const value = control();
    const deps = useResolved(dependencies);
    const depsChanged = deps.some((v, i) => v !== depsPrev[i]);

    if (value === valuePrev && !depsChanged) return;

    depsPrev = deps;
    valuePrev = transform(value, ...depsPrev);
    control(valuePrev);
  });
}
