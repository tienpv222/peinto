import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { $, render } from "voby";
import { Tab, TabList, TabPanel, Tabs } from "./Tabs";

describe("Tabs", async () => {
  const label = $("");
  const value = $("");
  const vertical = $(false);
  const manualActivate = $(false);
  const controlled = $(true);

  render(
    <Tabs
      label={label}
      value={value}
      vertical={vertical}
      manualActivate={manualActivate}
      controlled={controlled}
      onChange={value}
    >
      <TabList>
        <Tab value="0" />
        <Tab value="1" />
      </TabList>

      <TabPanel value="0" children="0" />
      <TabPanel value="1" children="1" />
    </Tabs>,
    document.body
  );

  const list = document.querySelector("ul")!;
  const tabs = document.querySelectorAll("li");
  const panels = document.querySelectorAll("section");

  test.each([0, 1])("Tab/Panel ids", (i) => {
    expect(tabs[i].getAttribute("aria-controls")).toBe(panels[i].id);
    expect(panels[i].getAttribute("aria-labelledby")).toBe(tabs[i].id);
  });

  test.each([
    ["foo", "foo", null],
    ["#foo", null, "foo"],
  ])("Label", (value, expected, expectedRef) => {
    label(value);
    expect(list.getAttribute("aria-label")).toBe(expected);
    expect(list.getAttribute("aria-labelledby")).toBe(expectedRef);
  });

  test.each([
    [true, "vertical"],
    [false, "horizontal"],
  ])("Vertical", (value, expected) => {
    vertical(value);
    expect(list.getAttribute("aria-orientation")).toBe(expected);
  });

  test.each([
    ["0", ["true", "false"], ["", null], ["0", ""]],
    ["1", ["false", "true"], [null, ""], ["", "1"]],
    ["", ["false", "false"], [null, null], ["", ""]],
  ])("Value", (_value, arias, datas, texts) => {
    value(_value);
    expect(tabs[0].getAttribute("aria-selected")).toBe(arias[0]);
    expect(tabs[1].getAttribute("aria-selected")).toBe(arias[1]);

    expect(panels[0].getAttribute("data-selected")).toBe(datas[0]);
    expect(panels[1].getAttribute("data-selected")).toBe(datas[1]);

    expect(panels[0].textContent).toBe(texts[0]);
    expect(panels[1].textContent).toBe(texts[1]);
  });

  test.each([0, 1])("Select", async (tab) => {
    await userEvent.click(tabs[tab]);
    expect(value()).toBe(String(tab));
  });

  test.each([
    [false, "{ArrowLeft}", "0"],
    [false, "{ArrowLeft}", "0"],
    [false, "{ArrowRight}", "1"],
    [false, "{ArrowRight}", "1"],
    [true, "{ArrowUp}", "0"],
    [true, "{ArrowUp}", "0"],
    [true, "{ArrowDown}", "1"],
    [true, "{ArrowDown}", "1"],
  ])("Auto activate", async (_vertical, key, _value) => {
    vertical(_vertical);

    await userEvent.keyboard(key);
    expect(value()).toEqual(_value);
  });

  test.each([
    [false, "{ArrowLeft}", 0, " ", "1"],
    [false, "{ArrowRight}", 1, " ", "0"],
    [true, "{ArrowUp}", 0, "{Enter}", "1"],
    [true, "{ArrowDown}", 1, "{Enter}", "0"],
  ])("Manual activate", async (_vertical, move, active, select, preValue) => {
    manualActivate(true);
    vertical(_vertical);

    await userEvent.keyboard(move);
    expect(tabs[active]).toBe(document.activeElement);
    expect(value()).toEqual(preValue);

    await userEvent.keyboard(select);
    expect(value()).toEqual(String(active));
  });

  test.each([0, 1])("Uncontrolled", async (tab) => {
    controlled(false);
    value(String(tab));
    expect(tabs[tab].getAttribute("aria-selected")).not.toBe("true");

    await userEvent.click(tabs[tab]);
    expect(tabs[tab].getAttribute("aria-selected")).toBe("true");
  });
});
