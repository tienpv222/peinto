import { Component, ComponentFunction } from "voby/dist/types";
import { JoinOver, Nullable } from "./common";

/** TYPES */

export type { Component };

export type ComponentProps<T> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T]
  : T extends ComponentFunction<infer P>
  ? P
  : {};

export type PolyProps<T, P = {}, P0 = {}, P1 = {}> = JoinOver<
  P,
  P0,
  P1,
  Partial<{
    as: T;
    ref: JSX.Refs<HTMLElement>;
    style: Nullable<JSX.StyleProperties>;
    children: JSX.Element;
  }>,
  ComponentProps<T>
>;

/** METHODS */

export const joinRefs = (
  ref: JSX.Ref<HTMLElement>,
  refs: JSX.Refs<HTMLElement>
) => {
  return [ref, refs].flat();
};

export const joinStyleOver = (
  style1: JSX.StyleProperties,
  style2: Nullable<JSX.StyleProperties>
) => {
  return {
    ...style2,
    ...style1,
  };
};
