import { batch, store, useCleanup, useEffect } from "voby";
import { Immutable } from "../utils/common";

export type TabKey = string;
export type TabId = `Tab-${TabKey}`;
export type TabPanelId = `TabPanel-${TabKey}`;

export type TabList = {
  element: HTMLElement;
  label: string;
  vertical: boolean;
  tabs: Record<TabKey, Tab>;
  selectedKey: TabKey;
  ref: typeof refTabList;
  refTab: typeof refTab;
  refPanel: typeof refPanel;
  setLabel: typeof setLabel;
  setVertical: typeof setVertical;
  selectTab: typeof selectTab;
};

export type Tab = {
  element: HTMLElement;
  id: TabId;
  selected: boolean;
  panelElement: HTMLElement;
  panelId: TabPanelId;
};

export type TabListOptions = { vertical?: boolean };

export type TabOptions = { selected?: boolean };

export const useTabList = () => {
  return store<TabList>({
    element: undefined!,
    vertical: false,
    label: "",
    tabs: {},
    selectedKey: "",
    ref: refTabList,
    refTab,
    refPanel,
    setLabel,
    setVertical,
    selectTab,
  }) as Immutable<TabList>;
};

function refTabList(
  this: TabList,
  label: string,
  options: TabListOptions = {}
) {
  return (element: HTMLElement) => {
    batch(() => {
      this.element = element;
      this.label = label;
      this.vertical = !!options.vertical;

      element.setAttribute("role", "tablist");
    });

    useEffect(() => {
      const { element, label, vertical } = this;

      const orientation = vertical ? "vertical" : "horizontal";
      element.setAttribute("aria-orientation", orientation);

      if (label.startsWith("#")) {
        element.removeAttribute("aria-label");
        element.setAttribute("aria-labelledby", label.slice(1));
      } else {
        element.removeAttribute("aria-labelledby");
        element.setAttribute("aria-label", label);
      }
    });

    useCleanup(() => {
      this.element = undefined!;
    });
  };
}

function refTab(this: TabList, key: TabKey, options: TabOptions = {}) {
  const id = `Tab-${key}` as const;

  if (this.tabs[key] || document.getElementById(id)) {
    throw Error(`Tab [${key}] duplicated`);
  }

  this.tabs[key] = {
    element: undefined!,
    id,
    selected: false,
    panelElement: undefined!,
    panelId: `TabPanel-${key}`,
  };

  return (element: HTMLElement) => {
    const tab = guardTab(this, key);
    tab.element = element;

    element.id = id;
    element.setAttribute("role", "tab");
    element.setAttribute("aria-controls", tab.panelId);

    element.addEventListener("click", () => {
      this.selectTab(key);
    });

    useEffect(() => {
      element.setAttribute("aria-selected", String(tab.selected));
    });

    useCleanup(() => {
      delete this.tabs[key];
    });

    if (options.selected) this.selectTab(key);
  };
}

function refPanel(this: TabList, key: TabKey) {
  const tab = guardTab(this, key);

  if (tab.panelElement || document.getElementById(tab.panelId)) {
    throw Error(`TabPanel [${key}] duplicated`);
  }

  useCleanup(() => {
    tab.panelElement = undefined!;
  });

  return (element: HTMLElement) => {
    tab.panelElement = element;

    element.id = tab.panelId;
    element.setAttribute("role", "tabpanel");
    element.setAttribute("aria-labelledby", tab.id);
  };
}

function setLabel(this: TabList, label: string) {
  this.label = label;
}

function setVertical(this: TabList, vertical = false) {
  this.vertical = vertical;
}

function selectTab(this: TabList, key: TabKey) {
  batch(() => {
    const { tabs, selectedKey: selectedTab } = this;
    const tab = guardTab(this, key);
    if (tab.selected) return;

    if (selectedTab) {
      tabs[selectedTab].selected = false;
    }

    tab.selected = true;
    this.selectedKey = key;
  });
}

const guardTab = (tabList: TabList, key: TabKey): Tab => {
  const tab = tabList.tabs[key];
  if (!tab) throw Error(`Tab [${key}] not found`);
  return tab;
};
