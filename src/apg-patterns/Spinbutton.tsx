import {
  $,
  $$,
  batch,
  createContext,
  FunctionMaybe,
  h,
  Observable,
  ObservableReadonly,
  useContext,
  useEffect,
  useMemo,
} from "voby";
import { assumeType, isNumber, Nullable, round } from "/src/utils/common";
import { Component, PolyProps } from "/src/utils/voby";
import { ariaLabel } from "/src/utils/wai-aria";

/** VARS */

const MIN = -Number.MAX_VALUE;
const MAX = Number.MAX_VALUE;
const STEP = 1;
const ROUND = 0;

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

export type SpinButtonProps<T = "div"> = PolyProps<
  T,
  Context,
  {
    label: FunctionMaybe<string>;
    value: FunctionMaybe<number>;
    max?: FunctionMaybe<Nullable<number>>;
    controlled?: FunctionMaybe<Nullable<boolean>>;
  }
>;

export type SpinTextProps<T = "input"> = PolyProps<T>;
export type SpinIncrementProps<T = "button"> = PolyProps<T>;
export type SpinDecrementProps<T = "button"> = PolyProps<T>;

/** METHODS */

const setValue = (ctx: Context, value: number, controlled = ctx.controlled) => {
  value = Math.max(value, $$(ctx.min) ?? MIN);
  value = Math.min(value, ctx.max() ?? MAX);
  value = round(value, $$(ctx.round) ?? ROUND);

  batch(() => {
    $$(controlled) || ctx.value(value);
    ctx.onChange?.(value);
  });
};

const moveValue = (ctx: Context, stepMultiplier: number) => {
  setValue(ctx, ctx.value() + ($$(ctx.step) ?? STEP) * stepMultiplier);
};

/** COMPONENTS */

export const SpinButton = <T extends Component = "div">(
  props: SpinButtonProps<T>
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
    controlled,

    value: $(0),
    max: useMemo(() => {
      const $$max = $$(max);
      return isNumber($$max) ? Math.max($$max, $$(min) ?? MIN) : $$max;
    }),
  };

  let init = true;
  useEffect(() => {
    if (!init && !$$(ctx.controlled)) return;

    init = false;
    setValue(ctx, $$(value), false);
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

export const SpinText = <T extends Component = "input">(
  props: SpinTextProps<T>
) => {
  const ctx = useContext(SpinContext)!;
  const { as, ...rest } = props;

  return h(as ?? "input", {
    ...rest,

    type: "number",
    value: ctx.value,

    onChange({ target }: InputEvent) {
      assumeType<HTMLInputElement>(target);
      setValue(ctx, Number(target.value));
    },

    onKeyDown(event: KeyboardEvent) {
      const { key, target } = event;
      assumeType<HTMLElement>(target);

      if (key === "Enter") {
        target.blur();
        return;
      }

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

export const SpinDecrement = <T extends Component = "button">(
  props: SpinDecrementProps<T>
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

export const SpinIncrement = <T extends Component = "button">(
  props: SpinIncrementProps<T>
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
