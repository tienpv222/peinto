import {
  $$,
  batch,
  createContext,
  FunctionMaybe,
  h,
  If,
  store,
  useContext,
  useEffect,
} from "voby";
import { assumeType, createId, isFunction, Nullable } from "/src/utils/common";
import { hashString } from "/src/utils/hash";
import { Component, joinRefs, PolyProps } from "/src/utils/voby";
import { ariaDisabled, ariaLabel, ariaOrientation } from "/src/utils/wai-aria";

/** VARS */

export const DATA_SELECTED = "data-selected";

const TabsContext = createContext<Context>();

const tabValues = new WeakMap<HTMLElement, FunctionMaybe<string>>();

/** TYPES */

type Context = {
  id: string;
  selecteds: Partial<Record<string, true>>;
  hasheds: Partial<Record<string, string>>;

  label: FunctionMaybe<string>;
  vertical?: FunctionMaybe<Nullable<boolean>>;
  manualActivate?: FunctionMaybe<Nullable<boolean>>;
  controlled?: FunctionMaybe<Nullable<boolean>>;
  onChange?: Nullable<(value: string) => void>;
};

export type TabProviderProps = {
  value: FunctionMaybe<string>;
  children?: JSX.Element;
} & Omit<Context, "id" | "selecteds" | "hasheds">;

export type TabListProps<T> = PolyProps<T>;

export type TabProps<T> = PolyProps<
  T,
  {
    value: FunctionMaybe<string>;
    disabled?: FunctionMaybe<Nullable<boolean>>;
  }
>;

export type TabPanelProps<T> = PolyProps<T, { value: FunctionMaybe<string> }>;

/** METHODS */

const getIds = ({ id, hasheds }: Context, value: FunctionMaybe<string>) => {
  const value_ = $$(value);
  const hashed = hasheds[value_] ?? (hasheds[value_] = hashString(value_));

  return {
    tabId: `_Tab_${id}_${hashed}`,
    panelId: `_TabPanel_${id}_${hashed}`,
  };
};

const setValue = (
  ctx: Context,
  value: FunctionMaybe<string>,
  controlled = ctx.controlled
) => {
  batch(() => {
    value = $$(value);

    $$(controlled) || store.reconcile(ctx.selecteds, { [value]: true });
    ctx.onChange?.(value);
  });
};

/** COMPONENTS */

export const TabProvider = (props: TabProviderProps) => {
  const { value, children, ...rest } = props;

  const ctx: Context = {
    ...(isFunction(value) && { controlled: true }),
    ...rest,
    id: createId(),
    selecteds: store({}),
    hasheds: {},
  };

  let init = true;
  useEffect(() => {
    if (!init && !$$(ctx.controlled)) return;

    init = false;
    setValue(ctx, value, false);
  });

  return h(TabsContext.Provider, { value: ctx, children });
};

export const TabList = <T extends Component = "ul">(props: TabListProps<T>) => {
  const ctx = useContext(TabsContext)!;
  const { as, ...rest } = props;

  return h(as ?? "ul", {
    ...rest,
    tabIndex: -1,

    role: "tablist",
    ...ariaLabel(ctx.label),
    ...ariaOrientation(ctx.vertical),
  });
};

export const Tab = <T extends Component = "li">(props: TabProps<T>) => {
  const ctx = useContext(TabsContext)!;
  const { as, value, disabled, ...rest } = props;

  return h(as ?? "li", {
    ...rest,

    ref: joinRefs((el) => {
      tabValues.set(el, value);

      useEffect(() => {
        $$(disabled) && el.blur();
      });
    }, rest.ref),

    id: () => getIds(ctx, value).tabId,
    tabIndex: () => (ctx.selecteds[$$(value)] ? 0 : -1),

    role: "tab",
    "aria-controls": () => getIds(ctx, value).panelId,
    "aria-selected": () => String(!!ctx.selecteds[$$(value)]),
    ...ariaDisabled(disabled),

    onClick() {
      if ($$(disabled)) return;
      setValue(ctx, value);
    },

    onKeyDown({ key, target }: KeyboardEvent) {
      assumeType<HTMLElement>(target);

      if (key === " " || key === "Enter") {
        setValue(ctx, value);
        return;
      }

      const direction = {
        ArrowUpfalse: -1,
        ArrowDownfalse: 1,
        ArrowLefttrue: -1,
        ArrowRighttrue: 1,
      }[key + !$$(ctx.vertical)];

      if (!direction) return;

      const pattern = `[id^=_Tab_${ctx.id}_]`;
      const tabEls = document.querySelectorAll<HTMLElement>(pattern);

      for (let i = 0, move = 0; ; i += move || 1) {
        if (!tabEls[i]) return;

        if (!move) {
          if (tabEls[i] === target) move = direction;
          continue;
        }

        if (tabEls[i].getAttribute("aria-disabled") === "true") continue;
        tabEls[i].focus();

        if ($$(ctx.manualActivate)) return;
        setValue(ctx, tabValues.get(tabEls[i])!);

        return;
      }
    },
  });
};

export const TabPanel = <T extends Component = "section">(
  props: TabPanelProps<T>
) => {
  const ctx = useContext(TabsContext)!;
  const { as, value, children, ...rest } = props;

  return h(as ?? "section", {
    ...rest,
    id: () => getIds(ctx, value).panelId,

    role: "tabpanel",
    "aria-labelledby": () => getIds(ctx, value).tabId,
    [DATA_SELECTED]: () => ctx.selecteds[$$(value)],

    children: h(If, {
      when: () => ctx.selecteds[$$(value)],
      children,
    }),
  });
};
