import { DragGesture } from "@use-gesture/vanilla";
import {
  $,
  $$,
  createContext,
  FunctionMaybe,
  h,
  Observable,
  ObservableReadonly,
  useCleanup,
  useContext,
  useEffect,
  useMemo,
} from "voby";
import { clamp, createId, Nullable, round } from "/src/utils/common";
import { Component, joinRefs, joinStyles, PolyProps } from "/src/utils/voby";
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
  value: Observable<number>;
  min: ObservableReadonly<number>;
  max: ObservableReadonly<number>;

  label: FunctionMaybe<string>;
  vertical?: FunctionMaybe<Nullable<boolean>>;
  reverse?: FunctionMaybe<Nullable<boolean>>;
  controlled?: FunctionMaybe<Nullable<boolean>>;
  onChange?: Nullable<(value: number) => void>;
};

export type SplitWindowProps<T> = PolyProps<
  T,
  Omit<Context, "id">,
  {
    value: FunctionMaybe<number>;
    min?: FunctionMaybe<Nullable<number>>;
    max?: FunctionMaybe<Nullable<number>>;
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

const setValue = (ctx: Context, value: number, controlled = ctx.controlled) => {
  value = round(clamp(value, ctx.min, ctx.max), ROUND);

  $$(controlled) || ctx.value(value);
  ctx.onChange?.(value);
};

/** COMPONENTS */

export const SplitWindow = <T extends Component = "div">(
  props: SplitWindowProps<T>
) => {
  const {
    as,
    label,
    value,
    min,
    max,
    vertical,
    reverse,
    controlled,
    onChange,
    ...rest
  } = props;

  const ctx: Context = {
    label,
    vertical,
    reverse,
    controlled,
    onChange,

    id: createId(),
    value: $(0),
  } as any;

  ctx.min = useMemo(() => round(clamp(min, MIN, MAX), ROUND));
  ctx.max = useMemo(() => round(clamp($$(max) ?? MAX, ctx.min, MAX), ROUND));

  let init = true;
  useEffect(() => {
    if (!init && !$$(ctx.controlled)) return;

    init = false;
    setValue(ctx, $$(value), false);
  });

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

        setValue(ctx, value);
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
