import {
  $$,
  batch,
  createContext,
  FunctionMaybe,
  If,
  Observable,
  store,
  useContext,
  useEffect,
} from "voby";
import { Component } from "voby/dist/types";
import { createId } from "../utils/common";
import { hashString } from "../utils/hash";
import {
  ComponentProps,
  controlledMaybe,
  Dynamic,
  isUncontrolled,
} from "../utils/voby";

/** VARS */

export const DATA_TABS_ID = "data-tabsid";
export const DATA_TAB_VALUE = "data-tabvalue";
export const DATA_SELECTED = "data-selected";

export const TabsContext = createContext<Tabs>();

/** TYPES */

export type Tabs = {
  label: FunctionMaybe<string>;
  vertical: FunctionMaybe<boolean>;
  autoActivate: FunctionMaybe<boolean>;
  deactivatable: FunctionMaybe<boolean>;
  unmountable: FunctionMaybe<boolean>;
  onChange?(value: string): void;

  id: string;
  value: Observable<string>;
  selecteds: Partial<Record<string, true>>;
};

export type TabsProps = Partial<
  Omit<Tabs, "value" | "tabs"> & {
    value: FunctionMaybe<string>;
    children?: JSX.Element;
  }
> & {
  label: FunctionMaybe<string>;
};

export type TabListProps<T> = {
  as?: T;
  children?: JSX.Element;
} & ComponentProps<T>;

export type TabProps<T> = {
  as?: T;
  value: string;
  children?: JSX.Element;
} & ComponentProps<T>;

export type TabPanelProps<T> = {
  as?: T;
  value: string;
  children?: JSX.Element;
} & ComponentProps<T>;

/** METHODS */

const getIdSet = (tabbedId: string, value: string) => {
  const hashed = hashString(value);

  return {
    tabId: `_Tab_${tabbedId}_${hashed}`,
    panelId: `_TabPanel_${tabbedId}_${hashed}`,
  };
};

const selectTab = ({ value, onChange }: Tabs, newValue: string) => {
  batch(() => {
    if (value() === newValue) return;

    isUncontrolled(value) && value(newValue);
    onChange?.(newValue);
  });
};

/** COMPONENTS */

export const Tabs = (props: TabsProps) => {
  const value = controlledMaybe(props.value ?? "");
  const selecteds: Tabs["selecteds"] = store({});

  useEffect(() => {
    store.reconcile(selecteds, { [value()]: true });
  });

  return (
    <TabsContext.Provider
      value={{
        vertical: false,
        autoActivate: true,
        deactivatable: false,
        unmountable: true,
        ...props,
        id: createId(),
        value,
        selecteds,
      }}
      children={props.children}
    />
  );
};

export function TabList<T extends Component = "ul">(props: TabListProps<T>) {
  const { label, vertical } = useContext(TabsContext)!;
  const { as, children, ...rest } = props;
  const isLabelId = () => $$(label)[0] === "#";

  return (
    <Dynamic
      component={as ?? "ul"}
      props={{
        ...rest,
        tabIndex: -1,
        role: "tablist",
        "aria-label": () => (isLabelId() ? null : $$(label)),
        "aria-labelledby": () => (isLabelId() ? $$(label).slice(1) : null),
        "aria-orientation": () => ($$(vertical) ? "vertical" : "horizontal"),
      }}
      children={children}
    />
  );
}

export const Tab = <T extends Component = "li">(props: TabProps<T>) => {
  const tabs = useContext(TabsContext)!;
  const { id, selecteds, vertical, autoActivate } = tabs;
  const { as, value, children, ...rest } = props;
  const { tabId, panelId } = getIdSet(id, value);

  return (
    <Dynamic
      component={props.as ?? "li"}
      props={{
        ...rest,
        id: tabId,
        tabIndex: () => (selecteds[value] ? 0 : -1),
        role: "tab",
        "aria-controls": panelId,
        "aria-selected": () => String(!!selecteds[value]),
        [DATA_TABS_ID]: id,
        [DATA_TAB_VALUE]: value,
        onClick() {
          selectTab(tabs, value);
        },
        onKeyDown({ key, target }: KeyboardEvent) {
          if (key === " " || key === "Enter") {
            selectTab(tabs, value);
            return;
          }

          const movement = {
            ArrowUptrue: -1,
            ArrowDowntrue: 1,
            ArrowLeftfalse: -1,
            ArrowRightfalse: 1,
          }[key + $$(vertical)];

          if (!movement) return;

          const pattern = `[${DATA_TABS_ID}="${id}"]`;
          const query = document.querySelectorAll<HTMLElement>(pattern);
          const els = Array.from(query);
          const el = els[els.indexOf(target as any) + movement];

          if (!el) return;
          el.focus();

          if (!$$(autoActivate)) return;
          selectTab(tabs, el.getAttribute(DATA_TAB_VALUE)!);
        },
      }}
      children={children}
    />
  );
};

export const TabPanel = <T extends Component = "li">(
  props: TabPanelProps<T>
) => {
  const { id, selecteds, unmountable } = useContext(TabsContext)!;
  const { as, value, children, ...rest } = props;
  const { tabId, panelId } = getIdSet(id, value);

  return (
    <Dynamic
      component={props.as ?? "li"}
      props={{
        ...rest,
        id: tabId,
        role: "tabpanel",
        "aria-labelledby": panelId,
        [DATA_SELECTED]: () => selecteds[value],
      }}
      children={
        <If
          when={() => selecteds[value] || !$$(unmountable)}
          children={children}
        />
      }
    />
  );
};
