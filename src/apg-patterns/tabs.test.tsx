import { describe, expect, test } from "vitest";
import { For, render } from "voby";
import { useTabList } from "./tabs";

const tabList = useTabList();
const libs = ["voby", "solid", "vue"];
const selecteds = [false, true, true];

render(
  <div>
    <ul ref={tabList.ref("libs")}>
      <For values={libs}>
        {(lib, i) => (
          <li ref={tabList.refTab(lib, { selected: selecteds[i()] })} />
        )}
      </For>
    </ul>

    <For values={libs}>
      {(lib) => (
        <section
          ref={tabList.refPanel(lib)}
          className={() => (tabList.selectedKey === lib ? "selected" : "")}
        />
      )}
    </For>
  </div>,
  document.body
);

const tabsEl = document.body.firstElementChild!;
const tabListEl = tabsEl.firstElementChild!;
const tabEls = Array.from(tabListEl.children);
const panelEls = Array.from(document.getElementsByTagName("section"));

describe("states", () => {
  test("role", () => {
    expect(tabListEl.getAttribute("role")).toBe("tablist");

    for (const el of tabEls) {
      expect(el.getAttribute("role")).toBe("tab");
    }

    for (const el of panelEls) {
      expect(el.getAttribute("role")).toBe("tabpanel");
    }
  });

  test("initial selected", () => {
    expect(tabEls[0].getAttribute("aria-selected")).toBe("false");
    expect(tabEls[1].getAttribute("aria-selected")).toBe("false");
    expect(tabEls[2].getAttribute("aria-selected")).toBe("true");

    expect(panelEls[0].className).toBe("");
    expect(panelEls[1].className).toBe("");
    expect(panelEls[2].className).toBe("selected");

    expect(tabList.selectedKey).toBe(libs[2]);
  });

  test("select tab", () => {
    tabList.selectTab(libs[1]);

    expect(tabEls[0].getAttribute("aria-selected")).toBe("false");
    expect(tabEls[1].getAttribute("aria-selected")).toBe("true");
    expect(tabEls[2].getAttribute("aria-selected")).toBe("false");

    expect(panelEls[0].className).toBe("");
    expect(panelEls[1].className).toBe("selected");
    expect(panelEls[2].className).toBe("");

    expect(tabList.selectedKey).toBe(libs[1]);
  });
});
