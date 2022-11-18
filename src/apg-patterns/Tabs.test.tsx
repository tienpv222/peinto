import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import { $, batch, render } from "voby";
import { Tab, TabList, TabPanel, TabProvider } from "./Tabs";

describe("Tabs", () => {
  const label = $("");
  const value = $("");
  const vertical = $(false);
  const manualActivate = $(false);
  const controlled = $(true);
  const disableds = [$(false), $(false), $(false)];

  render(
    <TabProvider
      label={label}
      value={value}
      vertical={vertical}
      manualActivate={manualActivate}
      controlled={controlled}
      onChange={value}
    >
      <TabList>
        <Tab value="0" disabled={disableds[0]} />
        <Tab value="1" disabled={disableds[1]} />
        <Tab value="2" disabled={disableds[2]} />
      </TabList>

      <TabPanel value="0" children="0" />
      <TabPanel value="1" children="1" />
      <TabPanel value="2" children="2" />
    </TabProvider>,
    document.body
  );

  const list = document.querySelector("ul")!;
  const tabs = document.querySelectorAll("li");
  const panels = document.querySelectorAll("section");

  beforeEach(() => {
    batch(() => {
      label("");
      value("");
      vertical(false);
      manualActivate(false);
      controlled(true);
      disableds.forEach((set) => set(false));
    });
  });

  test("Roles", () => {
    expect(list.getAttribute("role")).toBe("tablist");
    tabs.forEach((el) => expect(el.getAttribute("role")).toBe("tab"));
    panels.forEach((el) => expect(el.getAttribute("role")).toBe("tabpanel"));
  });

  test("Tab/Panel ids", () => {
    expect(tabs[0].getAttribute("aria-controls")).toBe(panels[0].id);
    expect(panels[0].getAttribute("aria-labelledby")).toBe(tabs[0].id);
  });

  test.each([
    ["foo", "foo", null],
    ["#foo", null, "foo"],
  ])("Label [%s]", (value, expected, expectedRef) => {
    label(value);
    expect(list.getAttribute("aria-label")).toBe(expected);
    expect(list.getAttribute("aria-labelledby")).toBe(expectedRef);
  });

  test.each([
    [true, "vertical"],
    [false, "horizontal"],
  ])("Vertical [%s]", (value, expected) => {
    vertical(value);
    expect(list.getAttribute("aria-orientation")).toBe(expected);
  });

  test.each([
    ["0", ["true", "false"], ["", null], ["0", ""]],
    ["1", ["false", "true"], [null, ""], ["", "1"]],
  ])("Value [%s]", (val, arias, datas, texts) => {
    value(val);

    for (const i in Array(2)) {
      expect(tabs[i].getAttribute("aria-selected")).toBe(arias[i]);
      expect(panels[i].getAttribute("data-selected")).toBe(datas[i]);
      expect(panels[i].textContent).toBe(texts[i]);
    }
  });

  test("Click", async () => {
    await userEvent.click(tabs[0]);
    expect(value()).toBe("0");
  });

  test.each([
    ["{ArrowLeft}", false, "0"],
    ["{ArrowRight}", false, "2"],
    ["{ArrowUp}", true, "0"],
    ["{ArrowDown}", true, "2"],
  ])("Auto activate [%s x 2]", async (key, vert, val) => {
    vertical(vert);
    await userEvent.click(tabs[1]);

    for (const _ in Array(2)) {
      await userEvent.keyboard(key);
      expect(value()).toEqual(val);
    }
  });

  test.each([
    ["{ArrowLeft}", "{ }", false, 0],
    ["{ArrowRight}", "{ }", false, 2],
    ["{ArrowUp}", "{Enter}", true, 0],
    ["{ArrowDown}", "{Enter}", true, 2],
  ])("Manual activate [%s > %s]", async (key, select, vert, active) => {
    manualActivate(true);
    vertical(vert);
    await userEvent.click(tabs[1]);

    await userEvent.keyboard(key);
    expect(tabs[active]).toBe(document.activeElement);
    expect(value()).toEqual("1");

    await userEvent.keyboard(select);
    expect(value()).toEqual(String(active));
  });

  test.each([
    ["blur", [0], ["true", null, null], document.body],
    ["jump", [1], [null, "true", null], tabs[2]],
    ["stay", [1, 2], [null, "true", "true"], tabs[0]],
  ])("Disabled [%s]", async (_case, disabledIdxes, arias, activeEl) => {
    await userEvent.click(tabs[0]);
    disabledIdxes.forEach((i) => disableds[i](true));

    for (const i in arias) {
      expect(tabs[i].getAttribute("aria-disabled")).toBe(arias[i]);
    }

    await userEvent.keyboard("{ArrowRight}");
    expect(activeEl).toBe(document.activeElement);
  });

  test("Uncontrolled", async () => {
    controlled(false);
    value(String(0));
    expect(tabs[0].getAttribute("aria-selected")).not.toBe("true");

    await userEvent.click(tabs[0]);
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");

    await userEvent.click(tabs[1]);
    expect(tabs[1].getAttribute("aria-selected")).toBe("true");
    expect(value()).toBe("1");
  });
});
