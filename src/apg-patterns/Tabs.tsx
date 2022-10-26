import {
  $$,
  batch,
  createContext,
  FunctionMaybe,
  If,
  store,
  useContext,
  useEffect,
} from "voby";
import { Component } from "voby/dist/types";
import { createId, GET_STR, JoinOver } from "../utils/common";
import { hashString } from "../utils/hash";
import {
  ComponentProps,
  controlledMaybe,
  Dynamic,
  isUncontrolled,
} from "../utils/voby";
import { ariaLabel, ariaOrientation } from "../utils/wai-aria";

/** VARS */

export const DATA_VALUE = "data-value";
export const DATA_SELECTED = "data-selected";

const SYMBOL_TAB_VALUE = Symbol();

const TabsContext = createContext<Context>();

/** TYPES */

declare global {
  interface HTMLElement {
    [SYMBOL_TAB_VALUE]?: string;
  }
}

type Context = {
  id: string;
  value: () => string;
  selecteds: Partial<Record<string, true>>;
  vertical: FunctionMaybe<boolean>;
  manualActivate: FunctionMaybe<boolean>;
  onChange?(value: string): void;
};

export type TabsProps = { children?: JSX.Element };

export type TabListProps<T> = JoinOver<
  {
    as?: T;
    label: FunctionMaybe<string>;
    value?: FunctionMaybe<string>;
    vertical?: FunctionMaybe<boolean>;
    manualActivate?: FunctionMaybe<boolean>;
    onChange?(value: string): void;
    children?: JSX.Element;
  },
  ComponentProps<T>
>;

export type TabProps<T> = JoinOver<
  {
    as?: T;
    value: string;
    children?: JSX.Element;
  },
  ComponentProps<T>
>;

export type TabPanelProps<T> = JoinOver<
  {
    as?: T;
    value: string;
    children?: JSX.Element;
  },
  ComponentProps<T>
>;

/** METHODS */

const getIds = (ctx: Context, value: string) => {
  const hashed = hashString(value);

  return {
    tabId: `_Tab_${ctx.id}_${hashed}`,
    panelId: `_TabPanel_${ctx.id}_${hashed}`,
  };
};

const selectTab = (ctx: Context, value: string) => {
  batch(() => {
    if (ctx.value() === value) return;

    isUncontrolled(ctx.value) && ctx.value(value);
    ctx.onChange?.(value);
  });
};

/** COMPONENTS */

export const Tabs = ({ children }: TabsProps) => {
  // const value = controlledMaybe(props.value ?? "");
  // const selecteds: Context["selecteds"] = store({});

  // useEffect(() => {
  //   store.reconcile(selecteds, { [value()]: true });
  // });

  return (
    <TabsContext.Provider
      value={{
        id: createId(),
        value: GET_STR,
        selecteds: store({}),
        vertical: false,
        manualActivate: false,
      }}
      children={children}
    />
  );
};

export function TabList<T extends Component = "ul">(props: TabListProps<T>) {
  const ctx = useContext(TabsContext)!;
  const {
    as,
    label,
    value,
    vertical,
    manualActivate,
    onChange,
    children,
    ...rest
  } = props;

  ctx.value = controlledMaybe(value ?? "");
  ctx.vertical = vertical ?? ctx.vertical;
  ctx.manualActivate = manualActivate ?? ctx.manualActivate;
  ctx.onChange = onChange;

  useEffect(() => {
    store.reconcile(ctx.selecteds, { [ctx.value()]: true });
  });

  return (
    <Dynamic
      component={as ?? "ul"}
      props={{
        ...rest,
        tabIndex: -1,
        role: "tablist",
        ...ariaLabel(label),
        ...ariaOrientation(ctx.vertical),
      }}
      children={children}
    />
  );
}

export const Tab = <T extends Component = "li">(props: TabProps<T>) => {
  const ctx = useContext(TabsContext)!;
  const { as, value, children, ...rest } = props;
  const { tabId, panelId } = getIds(ctx, value);

  return (
    <Dynamic
      component={props.as ?? "li"}
      props={{
        ...rest,
        ref(el: HTMLElement) {
          el[SYMBOL_TAB_VALUE] = value;
        },
        id: tabId,
        tabIndex: () => (ctx.selecteds[value] ? 0 : -1),
        role: "tab",
        "aria-controls": panelId,
        "aria-selected": () => String(!!ctx.selecteds[value]),
        onClick() {
          selectTab(ctx, value);
        },
        onKeyDown({ key, target }: KeyboardEvent) {
          if (key === " " || key === "Enter") {
            selectTab(ctx, value);
            return;
          }

          const movement = {
            ArrowUptrue: -1,
            ArrowDowntrue: 1,
            ArrowLeftfalse: -1,
            ArrowRightfalse: 1,
          }[key + $$(ctx.vertical)];

          if (!movement) return;

          const pattern = `[id^=_Tab_${ctx.id}_]`;
          const query = document.querySelectorAll<HTMLElement>(pattern);
          const els = Array.from(query);
          const el = els[els.indexOf(target as any) + movement];

          if (!el) return;
          el.focus();

          if (!$$(ctx.manualActivate)) return;
          selectTab(ctx, el[SYMBOL_TAB_VALUE]!);
        },
      }}
      children={children}
    />
  );
};

export const TabPanel = <T extends Component = "li">(
  props: TabPanelProps<T>
) => {
  const ctx = useContext(TabsContext)!;
  const { as, value, children, ...rest } = props;
  const { tabId, panelId } = getIds(ctx, value);

  return (
    <Dynamic
      component={props.as ?? "li"}
      props={{
        ...rest,
        id: panelId,
        role: "tabpanel",
        "aria-labelledby": tabId,
        [DATA_SELECTED]: () => ctx.selecteds[value],
      }}
    >
      <If when={() => ctx.selecteds[value]} children={children} />
    </Dynamic>
  );
};
