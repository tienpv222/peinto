import { $$, createContext, FunctionMaybe, h, useContext } from "voby";
import {
  assumeType,
  clamp,
  isNumber,
  Nullable,
  round,
} from "/src/utils/common";
import {
  Component,
  Control,
  ControlMaybe,
  PolyProps,
  useTransform,
} from "/src/utils/voby";
import { ariaLabel } from "/src/utils/wai-aria";

/** TYPES */

type Context = {
  value: Control<number>;
  max: Control<Nullable<number>>;

  min?: FunctionMaybe<Nullable<number>>;
  step?: FunctionMaybe<Nullable<number>>;
  scale?: FunctionMaybe<Nullable<number>>;
};

export type SpinbuttonProps<T = "div"> = PolyProps<
  T,
  Context,
  {
    label: FunctionMaybe<string>;
    value: ControlMaybe<number>;
    max?: ControlMaybe<Nullable<number>>;
  }
>;

export type SpinTextProps<T = "input"> = PolyProps<T>;
export type SpinIncrementProps<T = "button"> = PolyProps<T>;
export type SpinDecrementProps<T = "button"> = PolyProps<T>;

/** VARS */

const STEP = 1;
const SCALE = 0;

const SpinContext = createContext<Context>();

/** METHODS */

const moveValue = (ctx: Context, stepMultiply: number) => {
  const step = $$(ctx.step) ?? STEP;
  ctx.value(ctx.value() + step * stepMultiply);
};

/** COMPONENTS */

export const Spinbutton = <T extends Component = "div">(
  props: SpinbuttonProps<T>
) => {
  const { as, label, value, min, max, step, scale, ...rest } = props;

  const ctxMax = useTransform(
    max,
    (value, min) => (isNumber(value) ? clamp(value, min) : value),
    min
  );

  const ctxValue = useTransform(
    value,
    (value, min, max, scale) => {
      value = clamp(value, min, max);
      value = round(value, scale ?? SCALE);
      return value;
    },
    min,
    ctxMax,
    scale
  );

  const ctx: Context = {
    min,
    step,
    scale,

    value: ctxValue,
    max: ctxMax,
  };

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
      ctx.value(Number(target.value));
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
