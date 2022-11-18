import { beforeEach, describe, expect, test } from "vitest";
import { $, batch, render } from "voby";
import {
  SplitPrimaryPane,
  SplitSecondaryPane,
  Splitter,
  SplitWindow,
} from "./WindowSplitter";

describe("WindowSplitter", () => {
  const label = $("");
  const value = $(0);
  const min = $<number>();
  const max = $<number>();
  const vertical = $<boolean>();
  const reverse = $<boolean>();
  const controlled = $(true);

  render(
    <SplitWindow
      label={label}
      value={value}
      min={min}
      max={max}
      vertical={vertical}
      controlled={controlled}
    >
      <SplitPrimaryPane />
      <Splitter />
      <SplitSecondaryPane />
    </SplitWindow>,
    document.body
  );

  const root = document.querySelector("div")!;
  const panes = root.querySelectorAll("section");
  const splitter = root.querySelector("div")!;

  beforeEach(() => {
    batch(() => {
      label("");
      value(0);
      min(undefined);
      max(undefined);
      vertical(undefined);
      reverse(undefined);
      controlled(true);
    });
  });

  test("Roles", () => {
    expect(splitter.getAttribute("role")).toBe("separator");
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
    [-1, "0"],
    [1, "1"],
    [101, "100"],
  ] as const)("Value min [%s]", (value, expected) => {
    min(value);
    expect(splitter.getAttribute("aria-valuemin")).toBe(expected);
  });

  test.each([
    [undefined, 0, "100"],
    [-1, 0, "0"],
    [0, 1, "1"],
    [1, 0, "1"],
    [101, 0, "100"],
  ] as const)("Value max [%s] [min=%s]", (max_, min_, expected) => {
    min(min_);
    max(max_);
    expect(splitter.getAttribute("aria-valuemax")).toBe(expected);
  });

  test.each([
    [-1, 1, 100, "1"],
    [2, 1, undefined, "2"],
    [100, undefined, 99, "99"],
  ] as const)(
    "Value [%s] [min=%s] [max=%s]",
    (value_, min_, max_, expected) => {
      value(value_);
      min(min_);
      max(max_);
      expect(splitter.getAttribute("aria-valuenow")).toBe(expected);
    }
  );

  test.todo("Window resize");

  test.todo("Interactions");

  test.todo("Uncontrolled");
});
