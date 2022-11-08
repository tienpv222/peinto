import { $$, FunctionMaybe, h } from "voby";
import { Nullable } from "/src/utils/common";
import { Component, PolyProps } from "/src/utils/voby";
import { ariaDisabled, ariaLabel } from "/src/utils/wai-aria";

/** TYPES */

export type ButtonProps<T> = PolyProps<
  T,
  {
    label: FunctionMaybe<string>;
    disabled?: FunctionMaybe<Nullable<boolean>>;
    onActivate?: Nullable<(event: MouseEvent | KeyboardEvent) => void>;
  }
>;

/** COMPONENTS */

export const Button = <T extends Component = "button">(
  props: ButtonProps<T>
) => {
  const { as, label, disabled, children, onActivate, ...rest } = props;

  return h(as ?? "button", {
    ...rest,

    tabIndex: 0,
    role: "button",
    ...ariaLabel(label),
    ...ariaDisabled(disabled),

    onClick(event: MouseEvent) {
      if ($$(disabled)) return;

      onActivate?.(event);
    },

    onKeyDown(event: KeyboardEvent) {
      event.preventDefault();

      if ($$(disabled)) return;
      if (event.key !== " " && event.key !== "Enter") return;

      onActivate?.(event);
    },

    children,
  });
};
