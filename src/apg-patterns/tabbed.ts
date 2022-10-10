import { batch, store, useCleanup, useEffect } from "voby";
import { assumeMutable, Immutable, ImmutableMaybe } from "../utils/common";
import { delegate } from "../utils/delegate-event";
import { increaseId } from "../utils/incremental-id";

/** Error */
export class TabListNotFound extends Error {
  constructor() {
    super(`TabList not found`);
  }
}

export class TabNotFound extends Error {
  constructor(key: string) {
    super(`Tab [${key}] not found`);
  }
}

export class TabListExisted extends Error {
  constructor() {
    super(`TabList existed`);
  }
}

export class TabExisted extends Error {
  constructor(key: string) {
    super(`Tab [${key}] existed`);
  }
}

export class TabPanelExisted extends Error {
  constructor(key: string) {
    super(`TabPanel [${key}] existed`);
  }
}

/** VARS */
const TAB = Symbol();

export const DATA_TABBED = "data-tabbed";

/** TYPES */

export type Tabbed = {
  id: string;
  toggleable?: boolean;
  list?: TabList;
  tabs: Record<string, Tab | undefined>;
  panels: Record<string, TabPanel | undefined>;
  selectedKey: string;
};

export type TabList = {
  element?: HTMLElement;
  label: string;
  vertical?: boolean;
};

export type Tab = {
  element?: HTMLElement;
  selected?: boolean;
};

export type TabPanel = {
  element?: HTMLElement;
};

export const useTabbed = () => {
  return store<Tabbed>({
    id: increaseId(),
    tabs: {},
    panels: {},
    selectedKey: "",
  }) as Immutable<Tabbed>;
};

declare global {
  interface HTMLElement {
    [TAB]?: Tab;
  }
}

/** METHODS */

const getTabList = ({ list }: Tabbed) => {
  if (list) return list;
  throw new TabListNotFound();
};

const getTab = (tabbed: Tabbed, key: string) => {
  const tab = tabbed.tabs[key];
  if (!tab) throw new TabNotFound(key);
  return tab;
};

const getTabId = (tabbed: Tabbed, key: string) => {
  return `Tab-${key}-${tabbed.id}`;
};

const getPanelId = (tabbed: Tabbed, key: string) => {
  return `TabPanel-${key}-${tabbed.id}`;
};

export const useTabList = (
  tabbed: ImmutableMaybe<Tabbed>,
  label: string,
  vertical?: boolean
) => {
  assumeMutable(tabbed);

  if (tabbed.list) throw new TabListExisted();
  const list = (tabbed.list = store<TabList>({ label, vertical }));

  return (element: HTMLElement) => {
    list.element = element;

    element.setAttribute("role", "tablist");
    element.setAttribute(DATA_TABBED, tabbed.id);

    useEffect(() => {
      const { label, vertical } = list;

      if (label.startsWith("#")) {
        element.removeAttribute("aria-label");
        element.setAttribute("aria-labelledby", label.slice(1));
      } else {
        element.removeAttribute("aria-labelledby");
        element.setAttribute("aria-label", label);
      }

      const orientation = vertical ? "vertical" : "horizontal";
      element.setAttribute("aria-orientation", orientation);
    });
  };
};

export const useTab = (tabbed: ImmutableMaybe<Tabbed>, key: string) => {
  assumeMutable(tabbed);

  if (tabbed.tabs[key]) throw new TabExisted(key);
  const tab = (tabbed.tabs[key] = store<Tab>({}));

  return (element: HTMLElement) => {
    element[TAB] = tab;
    tab.element = element;

    element.id = getTabId(tabbed, key);
    element.setAttribute("role", "tab");
    element.setAttribute("aria-controls", getPanelId(tabbed, key));
    element.setAttribute(DATA_TABBED, tabbed.id);

    delegate("click", toggleTab, tabbed, key);

    useEffect(() => {
      element.setAttribute("aria-selected", tab.selected ? "true" : "false");
    });

    useCleanup(() => {
      element[TAB] = undefined;
      tabbed.tabs[key] = undefined;
    });
  };
};

export const useTabPanel = (tabbed: ImmutableMaybe<Tabbed>, key: string) => {
  assumeMutable(tabbed);

  if (tabbed.panels[key]) throw new TabPanelExisted(key);
  const panel = (tabbed.panels[key] = store<TabPanel>({}));

  return (element: HTMLElement) => {
    panel.element = element;

    element.id = getPanelId(tabbed, key);
    element.setAttribute("role", "tabpanel");
    element.setAttribute("aria-labelledby", getTabId(tabbed, key));
    element.setAttribute(DATA_TABBED, tabbed.id);

    useCleanup(() => {
      tabbed.panels[key] = undefined;
    });
  };
};

export const configTabbed = (
  tabbed: ImmutableMaybe<Tabbed>,
  options: {
    toggleable?: boolean;
  }
) => {
  assumeMutable(tabbed);
  tabbed.toggleable = options.toggleable ?? tabbed.toggleable;
};

export const configTabList = (
  tabbed: ImmutableMaybe<Tabbed>,
  options: {
    label?: string;
    vertical?: boolean;
  }
) => {
  assumeMutable(tabbed);

  batch(() => {
    const list = getTabList(tabbed);
    list.label = options.label ?? list.label;
    list.vertical = options.vertical ?? list.vertical;
  });
};

export const toggleTab = (tabbed: ImmutableMaybe<Tabbed>, key: string) => {
  assumeMutable(tabbed);

  batch(() => {
    const { selectedKey } = tabbed;
    const tab = getTab(tabbed, key);

    if (key !== selectedKey) {
      selectedKey && (getTab(tabbed, selectedKey).selected = false);
      tab.selected = true;

      tabbed.selectedKey = key;
    } else if (tabbed.toggleable) {
      tab.selected = false;
      tabbed.selectedKey = "";
    }
  });
};
