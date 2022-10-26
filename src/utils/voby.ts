import { $, createElement, FunctionMaybe, Observable } from "voby";
import { Component, ComponentFunction } from "voby/dist/types";
import { isFunction } from "./common";

/** VARS */

export const SYMBOL_UNCONTROLLED = Symbol();

/** TYPES */

export type ComponentProps<T> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T]
  : T extends ComponentFunction<infer P>
  ? P
  : {};

/** METHODS */

export const isUncontrolled = <T>(value: Observable<T>) => {
  return SYMBOL_UNCONTROLLED in value;
};

export const controlledMaybe = <T>(value: FunctionMaybe<T>) => {
  if (isFunction(value)) return value as Observable<T>;

  const uncontrolled = $(value);
  (uncontrolled as any)[SYMBOL_UNCONTROLLED] = true;
  return uncontrolled;
};

// Workaround for Voby bug
export const Dynamic = <P = {}>({
  component,
  props,
  children,
}: {
  component: Component<P>;
  props?: P;
  children?: JSX.Element;
}) => {
  return createElement<P>(component, props, children);
};
