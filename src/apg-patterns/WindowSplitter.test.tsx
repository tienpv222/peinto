import { beforeEach, describe, expect, test } from "vitest";
import { $, batch, render } from "voby";
import { PercentMaybe, Split } from "./WindowSplitter";

describe("WindowSplitter", () => {
  ResizeObserver = class CustomObs extends ResizeObserver {
    constructor(fn: any) {
      super(fn);
      fn([{ contentRect: { width: 200, height: 400 } }]);
    }
  };

  const label = $("");
  const value = $<number>(50);
  const min = $<PercentMaybe | null>(0);
  const max = $<PercentMaybe | null>("100%");
  const vertical = $(false);
  const controlled = $(true);

  render(
    <Split.Window
      label={label}
      value={value}
      min={min}
      max={max}
      vertical={vertical}
      controlled={controlled}
    >
      <Split.PrimaryPane />

      <Split.Splitter />

      <Split.SecondaryPane />
    </Split.Window>,
    document.body
  );

  const root = document.querySelector("div")!;
  const panes = root.querySelectorAll("section");
  const splitter = root.querySelector("div")!;

  beforeEach(() => {
    batch(() => {
      label("");
      value(50);
      min(0);
      max("100%");
      vertical(false);
      controlled(true);
    });
  });

  test("PrimaryPane id", () => {
    expect(splitter.getAttribute("aria-controls")).toBe(panes[0].id);
  });

  test.each([
    ["foo", "foo", null],
    ["#foo", null, "foo"],
  ])("Label [%s]", (value, expected, expectedRef) => {
    label(value);
    expect(splitter.getAttribute("aria-label")).toBe(expected);
    expect(splitter.getAttribute("aria-labelledby")).toBe(expectedRef);
  });

  test.each([
    [true, "vertical"],
    [false, null],
  ])("Vertical [%s]", (value, expected) => {
    vertical(value);
    expect(splitter.getAttribute("aria-orientation")).toBe(expected);
  });

  test.each([
    [null, ["0", "0"]],
    ["-1%", ["0", "0"]],
    ["1%", ["1", "1"]],
    ["101%", ["100", "100"]],
    [-1, ["0", "0"]],
    [1, ["0.5", "0.25"]],
    [401, ["100", "100"]],
  ] as const)("Value min [%s]", (value, expecteds) => {
    min(value);
    vertical(false);
    expect(splitter.getAttribute("aria-valuemin")).toBe(expecteds[0]);

    vertical(true);
    expect(splitter.getAttribute("aria-valuemin")).toBe(expecteds[1]);
  });

  test.each([
    [null, 0, ["100", "100"]],
    ["-1%", 0, ["0", "0"]],
    ["0%", "1%", ["1", "1"]],
    ["1%", 0, ["1", "1"]],
    ["101%", 0, ["100", "100"]],
    [-1, 0, ["0", "0"]],
    [0, 1, ["0.5", "0.25"]],
    [1, 0, ["0.5", "0.25"]],
    [401, 0, ["100", "100"]],
  ] as const)("Value max-min [%s] [%s] ", (maxVal, minVal, expecteds) => {
    min(minVal);
    max(maxVal);
    vertical(false);
    expect(splitter.getAttribute("aria-valuemax")).toBe(expecteds[0]);

    vertical(true);
    expect(splitter.getAttribute("aria-valuemax")).toBe(expecteds[1]);
  });

  test.each([
    [-1, "1%", "100%", "1"],
    [2, "1%", null, "2"],
    [100, null, "99%", "99"],
  ] as const)("Value [%s]", (val, minVal, maxVal, expected) => {
    value(val);
    min(minVal);
    max(maxVal);
    expect(splitter.getAttribute("aria-valuenow")).toBe(expected);
  });

  test.todo("Window resize");

  test.todo("Interactions");
});
