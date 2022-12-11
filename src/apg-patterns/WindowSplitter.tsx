import { DragGesture } from "@use-gesture/vanilla";
import {
  $$,
  createContext,
  FunctionMaybe,
  h,
  useCleanup,
  useContext,
} from "voby";
import { clamp, createId, Nullable, round } from "/src/utils/common";
import {
  Component,
  Control,
  ControlMaybe,
  joinRefs,
  joinStyles,
  PolyProps,
  useTransform,
} from "/src/utils/voby";
import { ariaLabel } from "/src/utils/wai-aria";

/** VARS */

export const CSS_VAR_VALUE = "--value";
export const DATA_REVERSE = "data-reverse";

const ROUND = 2;
const MIN = 0;
const MAX = 100;

const SplitContext = createContext<Context>();

/** TYPES */

type Context = {
  id: string;
  value: Control<number>;
  min: Control<Nullable<number>>;
  max: Control<Nullable<number>>;

  label: FunctionMaybe<string>;
  vertical?: FunctionMaybe<Nullable<boolean>>;
  reverse?: FunctionMaybe<Nullable<boolean>>;
};

export type SplitWindowProps<T> = PolyProps<
  T,
  Omit<Context, "id">,
  {
    value: ControlMaybe<number>;
    min?: ControlMaybe<Nullable<number>>;
    max?: ControlMaybe<Nullable<number>>;
  }
>;

export type SplitPrimaryPaneProps<T> = PolyProps<T>;
export type SplitSecondaryPaneProps<T> = PolyProps<T>;
export type SplitterProps<T> = PolyProps<T>;

export type DragMemo = {
  coord: 0 | 1;
  direction: -1 | 1;
  initial: number;
  total: number;
};

/** METHODS */

const getPrimaryPaneId = (ctx: Context) => {
  return `_Split_PrimaryPane_${ctx.id}`;
};

/** COMPONENTS */

export const SplitWindow = <T extends Component = "div">(
  props: SplitWindowProps<T>
) => {
  const { as, label, value, min, max, vertical, reverse, ...rest } = props;

  const ctxMin = useTransform(min, (value) =>
    round(clamp(value, MIN, MAX), ROUND)
  );

  const ctxMax = useTransform(
    max,
    (value, min) => round(clamp(value ?? MAX, min, MAX), ROUND),
    ctxMin
  );

  const ctxValue = useTransform(
    value,
    (value, min, max) => round(clamp(value, min, max), ROUND),
    ctxMin,
    ctxMax
  );

  const ctx: Context = {
    label,
    vertical,
    reverse,

    id: createId(),
    value: ctxValue,
    min: ctxMin,
    max: ctxMax,
  };

  return h(SplitContext.Provider, {
    value: ctx,

    children: h(as ?? "div", {
      ...rest,
      style: joinStyles(rest.style, {
        [CSS_VAR_VALUE]: () => `${ctx.value()}%`,
      }),
      [DATA_REVERSE]: () => $$(ctx.reverse),
    }),
  });
};

export const SplitPrimaryPane = <T extends Component = "section">(
  props: SplitPrimaryPaneProps<T>
) => {
  const ctx = useContext(SplitContext)!;
  const { as, ...rest } = props;

  return h(as ?? "section", {
    ...rest,
    id: getPrimaryPaneId(ctx),
  });
};

export const SplitSecondaryPane = <T extends Component = "section">(
  props: SplitSecondaryPaneProps<T>
) => {
  const { as, ...rest } = props;

  return h(as ?? "section", rest);
};

export const Splitter = <T extends Component = "div">(
  props: SplitterProps<T>
) => {
  const ctx = useContext(SplitContext)!;
  const { as, ...rest } = props;

  return h(as ?? "div", {
    ...rest,

    ref: joinRefs((el) => {
      const gesture = new DragGesture(el, (state) => {
        let memo: DragMemo = state.memo;

        if (!memo) {
          const coord = $$(ctx.vertical) ? 1 : 0;
          const direction = $$(ctx.reverse) ? -1 : 1;
          const size = coord ? "offsetHeight" : "offsetWidth";
          const initial = (el.previousSibling as HTMLElement)[size];
          const total = el.parentElement![size];

          memo = { coord, direction, initial, total };
        }

        const { coord, direction, initial, total } = memo;
        const move = state.movement[coord];
        const value = ((initial + move * direction) / total) * 100;

        ctx.value(value);
        return memo;
      });

      useCleanup(() => gesture.destroy());
    }, rest.ref),

    tabIndex: 0,

    role: "separator",
    "aria-controls": getPrimaryPaneId(ctx),
    "aria-valuenow": ctx.value,
    "aria-valuemin": ctx.min,
    "aria-valuemax": ctx.max,
    "aria-orientation": () => ($$(ctx.vertical) ? "vertical" : null),
    ...ariaLabel(ctx.label),
  });
};
