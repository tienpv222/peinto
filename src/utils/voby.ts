import { Component, ComponentFunction } from "voby/dist/types";
import { JoinAfter, Nullable } from "./common";

/** TYPES */

export type { Component };

export type ComponentProps<T> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T]
  : T extends ComponentFunction<infer P>
  ? P
  : {};

export type PolyProps<T, P0 = {}, P1 = {}, P2 = {}> = JoinAfter<
  ComponentProps<T>,
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

/** METHODS */

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
