import { describe, expect, test } from "vitest";
import { useResolved } from "voby";
import {
  configTabbed,
  configTabList,
  TabExisted,
  TabListExisted,
  TabNotFound,
  TabPanelExisted,
  toggleTab,
  useTab,
  useTabbed,
  useTabList,
  useTabPanel,
} from "./tabbed";

describe("Attributes", () => {
  test("Static attributes", async () => {
    const tabbed = useTabbed();
    const root = useResolved(
      <div>
        <ul ref={useTabList(tabbed, "")}>
          <li ref={useTab(tabbed, "a")} />
        </ul>
        <section ref={useTabPanel(tabbed, "a")} />
      </div>
    ) as HTMLElement;

    const tabList = root.querySelector("ul")!;
    const tab = root.querySelector("li")!;
    const tabPanel = root.querySelector("section")!;

    await Promise.resolve();

    expect(tabList.getAttribute("role")).toBe("tablist");
    expect(tab.getAttribute("role")).toBe("tab");
    expect(tab.getAttribute("aria-controls")).toBe(tabPanel.id);
    expect(tabPanel.getAttribute("role")).toBe("tabpanel");
    expect(tabPanel.getAttribute("aria-labelledby")).toBe(tab.id);
  });

  test("TabList label", async () => {
    const tabbed = useTabbed();
    const tabList = useResolved(
      <ul ref={useTabList(tabbed, "foo")} />
    ) as HTMLUListElement;

    await Promise.resolve();
    expect(tabList.getAttribute("aria-label")).toBe("foo");
    expect(tabList.getAttribute("aria-labelledby")).toBe(null);

    configTabList(tabbed, { label: "#bar" });
    expect(tabList.getAttribute("aria-label")).toBe(null);
    expect(tabList.getAttribute("aria-labelledby")).toBe("bar");
  });

  test("TabList orientation", async () => {
    const tabbed = useTabbed();
    const tabList = useResolved(
      <ul ref={useTabList(tabbed, "")} />
    ) as HTMLUListElement;

    await Promise.resolve();
    expect(tabList.getAttribute("aria-orientation")).toBe("horizontal");

    configTabList(tabbed, { vertical: true });
    expect(tabList.getAttribute("aria-orientation")).toBe("vertical");
  });

  test("Tab selection", async () => {
    const tabbed = useTabbed();
    const tabList = useResolved(
      <ul>
        <li ref={useTab(tabbed, "a")} />
        <li ref={useTab(tabbed, "b")} />
      </ul>
    ) as HTMLUListElement;

    const [tabA, tabB] = Array.from<HTMLLIElement>(
      tabList.querySelectorAll("li")
    );

    await Promise.resolve();
    expect(tabA.getAttribute("aria-selected")).toBe("false");
    expect(tabB.getAttribute("aria-selected")).toBe("false");

    toggleTab(tabbed, "a");
    expect(tabA.getAttribute("aria-selected")).toBe("true");
    expect(tabB.getAttribute("aria-selected")).toBe("false");

    toggleTab(tabbed, "b");
    expect(tabA.getAttribute("aria-selected")).toBe("false");
    expect(tabB.getAttribute("aria-selected")).toBe("true");
  });

  test("Tab toggleable", async () => {
    const tabbed = useTabbed();
    const tab = useResolved(<li ref={useTab(tabbed, "a")} />) as HTMLLIElement;

    await Promise.resolve();
    toggleTab(tabbed, "a");
    expect(tab.getAttribute("aria-selected")).toBe("true");

    toggleTab(tabbed, "a");
    expect(tab.getAttribute("aria-selected")).toBe("true");

    configTabbed(tabbed, { toggleable: true });
    toggleTab(tabbed, "a");
    expect(tab.getAttribute("aria-selected")).toBe("false");
  });
});

describe("Exceptions", () => {
  test("Use existing TabList", () => {
    expect(() => {
      const tabbed = useTabbed();
      useResolved(
        <div>
          <ul ref={useTabList(tabbed, "")} />
          <ul ref={useTabList(tabbed, "")} />
        </div>
      );
    }).toThrow(TabListExisted);
  });

  test("Use existing Tab", () => {
    expect(() => {
      const tabbed = useTabbed();
      useResolved(
        <ul>
          <li ref={useTab(tabbed, "a")} />
          <li ref={useTab(tabbed, "a")} />
        </ul>
      );
    }).toThrow(TabExisted);
  });

  test("Use existing TabPanel", () => {
    expect(() => {
      const tabbed = useTabbed();
      useResolved(
        <div>
          <section ref={useTabPanel(tabbed, "a")} />
          <section ref={useTabPanel(tabbed, "a")} />
        </div>
      );
    }).toThrow(TabPanelExisted);
  });

  test("Toggle unexisting Tab", () => {
    expect(() => {
      const tabbed = useTabbed();
      toggleTab(tabbed, "a");
    }).toThrow(TabNotFound);
  });
});
