import { hashNumber } from "./hash";

/** VARS */

export const GET_STR = () => "";

/** TYPES */

export type JoinOver<T, T0, T1 = T0, T2 = T1> = T &
  Omit<T0, keyof T> &
  Omit<T1, keyof T | keyof T0> &
  Omit<T2, keyof T | keyof T0 | keyof T1>;

/** METHODS */

export function assumeType<T>(_value: any): asserts _value is T {}

export const isFunction = (value: unknown): value is Function => {
  return typeof value === "function";
};

export const createId = (() => {
  let i = 0;
  return () => hashNumber(++i);
})();
