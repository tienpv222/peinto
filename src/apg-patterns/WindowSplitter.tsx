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
import { createId, isFunction, isNumber, Nullable } from "/src/utils/common";
import { Component, joinRefs, joinStyles, PolyProps } from "/src/utils/voby";
import { ariaLabel } from "/src/utils/wai-aria";

/** VARS */

export const CSS_VAR_VALUE = "--value";

const ROUNDING = 2;
const MIN = 0;
const MAX = 100;
const FALLBACK = 50;

const SplitContext = createContext<Context>();

/** TYPES */

export type PercentMaybe = number | `${number}%`;

type Context = {
  id: string;
  value: Observable<number>;
  min: ObservableReadonly<number>;
  max: ObservableReadonly<number>;
  windowRect: Observable<[number, number]>;
  windowSize: Observable<number>;

  label: FunctionMaybe<string>;
  vertical?: FunctionMaybe<Nullable<boolean>>;
  controlled?: FunctionMaybe<Nullable<boolean>>;
  onChange?: Nullable<(value: number) => void>;
};

export type WindowProps<T> = PolyProps<
  T,
  Pick<Context, "label" | "vertical" | "controlled" | "onChange">,
  {
    value?: FunctionMaybe<Nullable<number>>;
    min?: FunctionMaybe<Nullable<PercentMaybe>>;
    max?: FunctionMaybe<Nullable<PercentMaybe>>;
  }
>;

export type PrimaryPaneProps<T> = PolyProps<T>;

export type SecondaryPaneProps<T> = PolyProps<T>;

export type SplitterProps<T> = PolyProps<T>;

export type DragMemo = {
  coord: 0 | 1;
  initial: number;
  total: number;
};

/** METHODS */

const getPrimaryPaneId = (ctx: Context) => {
  return `_Split_PrimaryPane_${ctx.id}`;
};

const getCoord = (ctx: Context) => {
  return $$(ctx.vertical) ? 1 : 0;
};

const getLimit = (
  ctx: Context,
  limit: FunctionMaybe<Nullable<PercentMaybe>>,
  fallback: number,
  min: number,
  max: number
) => {
  let value = $$(limit);

  if (isNumber(value)) {
    const total = ctx.windowSize();
    value = total ? (value / total) * 100 : fallback;
  } else {
    value = value ? parseFloat(value) : fallback;
  }

  value = Math.max(value, min);
  value = Math.min(value, max);

  return Number(value.toFixed(ROUNDING));
};

const setValue = (ctx: Context, value: number, skip?: unknown) => {
  value = Math.max(value, ctx.min());
  value = Math.min(value, ctx.max());
  value = Number(value.toFixed(ROUNDING));

  skip || ctx.value(value);
  return value;
};

const dragSplitter = (ctx: Context, value: number) => {
  value = setValue(ctx, value, $$(ctx.controlled));
  ctx.onChange?.(value);
};

/** COMPONENTS */

const Window = <T extends Component = "div">(props: WindowProps<T>) => {
  const {
    as,
    label,
    value,
    min,
    max,
    vertical,
    controlled,
    onChange,
    ...rest
  } = props;

  const ctx: Context = {
    ...(isFunction(value) && { controlled: true }),
    label,
    vertical,
    controlled,
    onChange,

    id: createId(),
    value: $(FALLBACK),
    windowRect: $([0, 0]),
  } as any;

  ctx.windowSize = useMemo(() => ctx.windowRect()[getCoord(ctx)]);
  ctx.min = useMemo(() => getLimit(ctx, min, MIN, MIN, MAX));
  ctx.max = useMemo(() => getLimit(ctx, max, MAX, ctx.min(), MAX));

  let init = true;
  useEffect(() => {
    if (!init && !$$(ctx.controlled)) return;

    init = false;
    setValue(ctx, $$(value) ?? FALLBACK);
  });

  return h(SplitContext.Provider, {
    value: ctx,

    children: h(as ?? "div", {
      ...rest,

      ref: joinRefs((el) => {
        new ResizeObserver(([entry]) => {
          const { width, height } = entry.contentRect;

          ctx.windowRect([width, height]);
          setValue(ctx, ctx.value());
        }).observe(el);
      }, rest.ref),

      style: joinStyles(rest.style, {
        [CSS_VAR_VALUE]: () => `${ctx.value()}%`,
      }),
    }),
  });
};

const PrimaryPane = <T extends Component = "section">(
  props: PrimaryPaneProps<T>
) => {
  const ctx = useContext(SplitContext)!;
  const { as, ...rest } = props;

  return h(as ?? "section", {
    ...rest,
    id: getPrimaryPaneId(ctx),
  });
};

const SecondaryPane = <T extends Component = "section">(
  props: SecondaryPaneProps<T>
) => {
  const { as, ...rest } = props;

  return h(as ?? "section", rest);
};

const Splitter = <T extends Component = "div">(props: SplitterProps<T>) => {
  const ctx = useContext(SplitContext)!;
  const { as, ...rest } = props;

  return h(as ?? "div", {
    ...rest,

    ref: joinRefs((el) => {
      const gesture = new DragGesture(el, (state) => {
        const memo: DragMemo = state.memo ?? {
          coord: getCoord(ctx),
          initial: ctx.value(),
          total: ctx.windowSize(),
        };

        const { coord, initial, total } = memo;
        const value = initial + (state.movement[coord] / total) * 100;

        dragSplitter(ctx, value);
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

/** RE-EXPORTS */

export const Split = {
  Window,
  PrimaryPane,
  SecondaryPane,
  Splitter,
} as const;
