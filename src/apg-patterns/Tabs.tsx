import { Nullable } from "vitest";
import {
  $,
  $$,
  createContext,
  Dynamic,
  FunctionMaybe,
  If,
  Observable,
  store,
  useContext,
  useEffect,
} from "voby";
import { assumeType, createId, JoinOver } from "/src/utils/common";
import { hashString } from "/src/utils/hash";
import { Component, joinRefs, PolyProps } from "/src/utils/voby";
import { ariaLabel, ariaOrientation } from "/src/utils/wai-aria";

/** VARS */

export const DATA_SELECTED = "data-selected";

const TabsContext = createContext<Context>();

const tabValues = new WeakMap<HTMLElement, FunctionMaybe<string>>();

/** TYPES */

type Context = Readonly<{
  id: string;
  value: Observable<string>;
  selecteds: Partial<Record<string, true>>;
  hasheds: Partial<Record<string, string>>;

  label: FunctionMaybe<string>;
  vertical?: FunctionMaybe<Nullable<boolean>>;
  manualActivate?: FunctionMaybe<Nullable<boolean>>;
  controlled?: FunctionMaybe<Nullable<boolean>>;
  onChange?: Nullable<(value: string) => void>;
}>;

export type TabsProps = JoinOver<
  {
    value?: FunctionMaybe<Nullable<string>>;
    children?: JSX.Element;
  },
  Omit<Context, "id" | "selecteds" | "hasheds">
>;

export type TabListProps<T> = PolyProps<T>;

export type TabProps<T> = PolyProps<T, { value: FunctionMaybe<string> }>;

export type TabPanelProps<T> = PolyProps<T, { value: FunctionMaybe<string> }>;

/** METHODS */

const getIds = ({ id, hasheds }: Context, value: FunctionMaybe<string>) => {
  const _val = $$(value);
  const hashed = hasheds[_val] ?? (hasheds[_val] = hashString(_val));

  return {
    tabId: `_Tab_${id}_${hashed}`,
    panelId: `_TabPanel_${id}_${hashed}`,
  };
};

/** COMPONENTS */

export const Tabs = (props: TabsProps) => {
  const { value, children, ...rest } = props;

  const ctx: Context = {
    ...rest,
    id: createId(),
    value: $($$(value) ?? ""),
    selecteds: store({}),
    hasheds: {},
  };

  useEffect(() => {
    if (!$$(ctx.controlled)) return;
    ctx.value($$(value) ?? "");
  });

  useEffect(() => {
    const value = ctx.value();
    store.reconcile(ctx.selecteds, { [value]: true });
    ctx.onChange?.(value);
  });

  return <TabsContext.Provider value={ctx} children={children} />;
};

export function TabList<T extends Component = "ul">(props: TabListProps<T>) {
  const ctx = useContext(TabsContext)!;
  const { as, children, ...rest } = props;

  return (
    <Dynamic
      component={as ?? "ul"}
      props={{
        ...rest,
        tabIndex: -1,
        role: "tablist",
        ...ariaLabel(ctx.label),
        ...ariaOrientation(ctx.vertical),
      }}
      children={children}
    />
  );
}

export const Tab = <T extends Component = "li">(props: TabProps<T>) => {
  const ctx = useContext(TabsContext)!;
  const { as, value, children, ...rest } = props;

  return (
    <Dynamic
      component={props.as ?? "li"}
      props={{
        ...rest,
        ref: joinRefs((el) => {
          tabValues.set(el, value);
        }, rest.ref),
        id: () => getIds(ctx, value).tabId,
        tabIndex: () => (ctx.selecteds[$$(value)] ? 0 : -1),
        role: "tab",
        "aria-controls": () => getIds(ctx, value).panelId,
        "aria-selected": () => String(!!ctx.selecteds[$$(value)]),
        onClick() {
          ctx.value($$(value));
        },
        onKeyDown({ key, target }: KeyboardEvent) {
          assumeType<HTMLElement>(target);

          if (key === " " || key === "Enter") {
            ctx.value($$(value));
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
          const matches = document.querySelectorAll<HTMLElement>(pattern);
          const tabEls = Array.from(matches);
          const nextEl = tabEls[tabEls.indexOf(target) + movement];

          if (!nextEl) return;
          nextEl.focus();

          if ($$(ctx.manualActivate)) return;
          ctx.value($$(tabValues.get(nextEl)!));
        },
      }}
      children={children}
    />
  );
};

export const TabPanel = <T extends Component = "section">(
  props: TabPanelProps<T>
) => {
  const ctx = useContext(TabsContext)!;
  const { as, value, children, ...rest } = props;

  return (
    <Dynamic
      component={props.as ?? "section"}
      props={{
        ...rest,
        id: () => getIds(ctx, value).panelId,
        role: "tabpanel",
        "aria-labelledby": () => getIds(ctx, value).tabId,
        [DATA_SELECTED]: () => ctx.selecteds[$$(value)],
      }}
    >
      <If when={() => ctx.selecteds[$$(value)]} children={children} />
    </Dynamic>
  );
};
