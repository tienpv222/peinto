import {
  $,
  $$,
  createContext,
  FunctionMaybe,
  h,
  Observable,
  ObservableReadonly,
  useContext,
  useEffect,
  useMemo,
} from "voby";
import { assumeType, isFunction, isNumber, Nullable } from "/src/utils/common";
import { Component, PolyProps } from "/src/utils/voby";
import { ariaLabel } from "/src/utils/wai-aria";

/** VARS */

const STEP = 1;
const ROUND = 2;

const SpinContext = createContext<Context>();

/** TYPES */

type Context = {
  value: Observable<number>;
  max: ObservableReadonly<Nullable<number>>;
  controlled?: FunctionMaybe<Nullable<boolean>>;

  min?: FunctionMaybe<Nullable<number>>;
  step?: FunctionMaybe<Nullable<number>>;
  round?: FunctionMaybe<Nullable<number>>;
  onChange?: Nullable<(value: number) => void>;
};

export namespace Spin {
  export type ButtonProps<T = "div"> = PolyProps<
    T,
    Context,
    {
      label: FunctionMaybe<string>;
      value: FunctionMaybe<number>;
      max?: FunctionMaybe<Nullable<number>>;
    }
  >;

  export type TextProps<T = "input"> = PolyProps<T>;
  export type IncrementProps<T = "button"> = PolyProps<T>;
  export type DecrementProps<T = "button"> = PolyProps<T>;
}

/** METHODS */

const setValue = (ctx: Context, value: number, skip?: unknown) => {
  value = Math.max(value, $$(ctx.min) ?? -Infinity);
  value = Math.min(value, ctx.max() ?? Infinity);
  value = Number(value.toFixed($$(ctx.round) ?? ROUND));

  skip || ctx.value(value);
  return value;
};

const updateValue = (ctx: Context, value: number) => {
  value = setValue(ctx, value, $$(ctx.controlled));
  ctx.onChange?.(value);
};

const moveValue = (ctx: Context, stepMultiplier: number) => {
  const value = setValue(
    ctx,
    ctx.value() + ($$(ctx.step) ?? STEP) * stepMultiplier,
    $$(ctx.controlled)
  );
  ctx.onChange?.(value);
};

/** COMPONENTS */

export const Button = <T extends Component = "div">(
  props: Spin.ButtonProps<T>
) => {
  const {
    as,
    label,
    value,
    min,
    max,
    step,
    round,
    controlled,
    onChange,
    ...rest
  } = props;

  const ctx: Context = {
    min,
    step,
    round,
    onChange,

    value: $(0),
    max: useMemo(() => {
      const $$max = $$(max);
      return isNumber($$max) ? Math.max($$max, $$(min) ?? -Infinity) : $$max;
    }),
    controlled: controlled ?? isFunction(value),
  };

  let init = true;
  useEffect(() => {
    if (!init && !$$(ctx.controlled)) return;

    init = false;
    setValue(ctx, $$(value));
  });

  return h(SpinContext.Provider, {
    value: ctx,
    children: h(as ?? "div", {
      ...rest,

      role: "spinbutton",
      "aria-valuenow": ctx.value,
      "aria-valuemin": ctx.min,
      "aria-valuemax": ctx.max,
      ...ariaLabel(label),
    }),
  });
};

export const Text = <T extends Component = "input">(
  props: Spin.TextProps<T>
) => {
  const ctx = useContext(SpinContext)!;
  const { as, ...rest } = props;

  return h(as ?? "input", {
    ...rest,

    type: "number",
    value: ctx.value,

    onChange({ target }: InputEvent) {
      assumeType<HTMLInputElement>(target);
      updateValue(ctx, Number(target.value));
    },

    onKeyDown(event: KeyboardEvent) {
      const { key, target } = event;
      assumeType<HTMLElement>(target);

      const stepMultiplier = {
        ArrowUp: 1,
        ArrowDown: -1,
        PageUp: Infinity,
        PageDown: -Infinity,
      }[key];

      if (!stepMultiplier) return;

      moveValue(ctx, stepMultiplier);
      event.preventDefault();
    },

    children: null,
  });
};

export const Decrement = <T extends Component = "button">(
  props: Spin.DecrementProps<T>
) => {
  const ctx = useContext(SpinContext)!;
  const { as, ...rest } = props;

  return h(as ?? "button", {
    ...rest,
    tabIndex: -1,
    onClick() {
      moveValue(ctx, -1);
    },
  });
};

export const Increment = <T extends Component = "button">(
  props: Spin.IncrementProps<T>
) => {
  const ctx = useContext(SpinContext)!;
  const { as, ...rest } = props;

  return h(as ?? "button", {
    ...rest,
    tabIndex: -1,
    onClick() {
      moveValue(ctx, 1);
    },
  });
};

/** RE-EXPORTS */

export const Spin = {
  Button,
  Text,
  Increment,
  Decrement,
} as const;
