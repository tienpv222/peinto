export type Immutable<T> = {
  readonly [K in keyof T]: T[K] extends Function ? T[K] : Immutable<T[K]>;
};

export type Mutable<T> = T extends Immutable<infer U> ? U : T;

export type ImmutableMaybe<T> = T | Immutable<T>;

// @ts-ignore
export function assumeMutable<T>(_value: T): asserts _value is Mutable<T> {}
