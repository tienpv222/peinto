import { hashNumber } from "./hash";

export function assumeType<T>(_value: any): asserts _value is T {}

export const isFunction = (value: unknown): value is Function => {
  return typeof value === "function";
};

export const createId = (() => {
  let i = 0;
  return () => hashNumber(++i);
})();
