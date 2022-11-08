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

  min?: FunctionMaybe<Nullable<number>>;
  step?: FunctionMaybe<Nullable<number>>;
  round?: FunctionMaybe<Nullable<number>>;
  controlled?: FunctionMaybe<Nullable<boolean>>;
  onChange?: Nullable<(value: number) => void>;
};

export type ButtonProps<T> = PolyProps<
  T,
  Omit<Context, "value">,
  {
    label: FunctionMaybe<string>;
    value: FunctionMaybe<number>;
    max?: FunctionMaybe<Nullable<number>>;
  }
>;

export type TextProps<T> = PolyProps<T>;

export type IncrementProps<T> = PolyProps<T>;

export type DecrementProps<T> = PolyProps<T>;

/** METHODS */

const setValue = (ctx: Context, value: number, skip?: unknown) => {
  value = Math.max(value, $$(ctx.min) ?? -Infinity);
  value = Math.min(value, $$(ctx.max) ?? Infinity);
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

export const Button = <T extends Component = "div">(props: ButtonProps<T>) => {
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
    ...(isFunction(value) && { controlled: true }),
    step,
    round,
    controlled,
    onChange,

    value: $(0),
    min,
    max: useMemo(() => {
      const $$max = $$(max);
      return isNumber($$max) ? Math.max($$max, $$(min) ?? -Infinity) : $$max;
    }),
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

      tabIndex: 0,
      role: "spinbutton",
      "aria-valuenow": ctx.value,
      "aria-valuemin": ctx.min,
      "aria-valuemax": ctx.max,
      ...ariaLabel(label),

      onKeyDown({ key, target }: KeyboardEvent) {
        assumeType<HTMLElement>(target);

        const stepMultiplier = {
          ArrowUp: 1,
          ArrowDown: -1,
          PageUp: Infinity,
          PageDown: -Infinity,
        }[key];

        if (!stepMultiplier) return;
        moveValue(ctx, stepMultiplier);
      },
    }),
  });
};

export const Text = <T extends Component = "input">(props: TextProps<T>) => {
  const ctx = useContext(SpinContext)!;
  const { as, ...rest } = props;

  return h(as ?? "input", {
    ...rest,

    tabIndex: -1,
    type: "number",
    value: ctx.value,

    onChange({ target }: InputEvent) {
      assumeType<HTMLInputElement>(target);
      updateValue(ctx, Number(target.value));
    },

    onKeyDown(event: KeyboardEvent) {
      if (!["ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
    },

    children: null,
  });
};

export const Decrement = <T extends Component = "button">(
  props: DecrementProps<T>
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
  props: IncrementProps<T>
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
