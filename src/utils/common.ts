import { hashNumber } from "./hash";

/** TYPES */

export type Nullable<T> = JSX.Nullable<T>;

export type JoinOver<T, T0 = {}, T1 = {}, T2 = {}, T3 = {}, T4 = {}> = T &
  Omit<T0, keyof T> &
  Omit<T1, keyof T | keyof T0> &
  Omit<T2, keyof T | keyof T0 | keyof T1> &
  Omit<T3, keyof T | keyof T0 | keyof T1 | keyof T2> &
  Omit<T4, keyof T | keyof T0 | keyof T1 | keyof T2 | keyof T3>;

/** METHODS */

export function assumeType<T>(_value: unknown): asserts _value is T {}

export const isFunction = (value: unknown): value is Function => {
  return typeof value === "function";
};

export const isNullLike = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

export const createId = (() => {
  let i = 0;
  return () => hashNumber(++i);
})();

export const filterNullLike = <T extends Record<string, unknown>>(value: T) => {
  for (const prop in value) {
    if (!isNullLike(value[prop])) continue;
    delete value[prop];
  }

  return value as Partial<T>;
};
