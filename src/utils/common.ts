export type Immutable<T> = {
  readonly [K in keyof T]: T[K] extends Function
    ? AnyThis<T[K]>
    : Immutable<T[K]>;
};

export type AnyThis<T> = T extends (...args: infer A) => infer R
  ? (this: any, ...args: A) => R
  : never;

export function assertHTMLElement(
  name: string,
  value: unknown
): asserts value is HTMLElement {
  if (value instanceof HTMLElement) return;
  throw Error(`${name} not HTMLElement`);
}
