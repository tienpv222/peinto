import { Component, ComponentFunction } from "voby/dist/types";
import { hashNumber } from "./hash";

/** TYPES */

export type JoinOver<T, T0, T1 = T0, T2 = T1> = T &
  Omit<T0, keyof T> &
  Omit<T1, keyof T | keyof T0> &
  Omit<T2, keyof T | keyof T0 | keyof T1>;

export type { Component };

export type ComponentProps<T> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T]
  : T extends ComponentFunction<infer P>
  ? P
  : {};

export type PolyProps<T, P = {}> = JoinOver<
  P,
  Partial<{
    as: T;
    ref: JSX.Refs<HTMLElement>;
    children: JSX.Element;
  }>,
  ComponentProps<T>
>;

/** METHODS */

export function assumeType<T>(_value: any): asserts _value is T {}

export const isFunction = (value: unknown): value is Function => {
  return typeof value === "function";
};

export const createId = (() => {
  let i = 0;
  return () => hashNumber(++i);
})();

export const joinRefs = (
  ref: JSX.Ref<HTMLElement>,
  refs: JSX.Refs<HTMLElement>
) => {
  return [ref, refs].flat();
};
