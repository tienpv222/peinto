import { hash } from "ohash";

/** TYPES */

export type Immutable<T> = {
  readonly [K in keyof T]: T[K] extends Function ? T[K] : Immutable<T[K]>;
};

export type Nullable<T> = JSX.Nullable<T>;

export type JoinAfter<T4 = {}, T3 = {}, T2 = {}, T1 = {}, T0 = {}> = T0 &
  Omit<T1, keyof T0> &
  Omit<T2, keyof T0 | keyof T1> &
  Omit<T3, keyof T0 | keyof T1 | keyof T2> &
  Omit<T4, keyof T0 | keyof T1 | keyof T2 | keyof T3>;

/** METHODS */

export function assumeType<T>(_value: unknown): asserts _value is T {}

export const isNumber = (value: unknown): value is number => {
  return typeof value === "number";
};

export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

export const isFunction = (value: unknown): value is Function => {
  return typeof value === "function";
};

export const isUndefined = (value: unknown): value is undefined => {
  return typeof value === "undefined";
};

export const isNullLike = (value: unknown): value is null | undefined => {
  return value === null || isUndefined(value);
};

export const round = (value: number, precision: number) => {
  return Number(value.toFixed(precision));
};

export const clamp = (
  value: Nullable<number>,
  min?: Nullable<number>,
  max?: Nullable<number>
) => {
  min = min ?? -Infinity;
  max = max ?? Infinity;

  return Math.min(Math.max(value ?? min, min), max);
};

export const createId = (() => {
  let i = 0;
  return () => hash(++i);
})();
