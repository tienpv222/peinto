import { fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import { $, batch, render } from "voby";
import {
  Spinbutton,
  SpinDecrement,
  SpinIncrement,
  SpinText,
} from "./Spinbutton";

describe("Spinbutton", () => {
  const label = $("");
  const value = $(0);
  const min = $<number | null>(null);
  const max = $<number | null>(null);
  const step = $<number | null>(null);
  const scale = $<number | null>(null);

  render(
    <Spinbutton
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      scale={scale}
    >
      <SpinText />

      <SpinDecrement />
      <SpinIncrement />
    </Spinbutton>,
    document.body
  );

  const button = document.querySelector("div")!;
  const text = document.querySelector("input")!;
  const controls = document.querySelectorAll("button");

  beforeEach(() => {
    batch(() => {
      label("");
      value(0);
      min(null);
      max(null);
      step(null);
      scale(null);
    });
  });

  test("Roles", () => {
    expect(button.getAttribute("role")).toBe("spinbutton");
  });

  test.each([
    ["foo", "foo", null],
    ["#foo", null, "foo"],
  ])("Label [%s]", (value, expected, expectedRef) => {
    label(value);
    expect(button.getAttribute("aria-label")).toBe(expected);
    expect(button.getAttribute("aria-labelledby")).toBe(expectedRef);
  });

  test.each([
    [null, null, null, null],
    [0, 1, "0", "1"],
    [2, 1, "2", "2"],
  ])("Cap [min=%s] [max=%s]", (minVal, maxVal, ariaMin, ariaMax) => {
    min(minVal);
    max(maxVal);
    expect(button.getAttribute("aria-valuemin")).toBe(ariaMin);
    expect(button.getAttribute("aria-valuemax")).toBe(ariaMax);
  });

  test.each([
    [0, null, null, "0"],
    [0, 1, null, "1"],
    [0, null, -1, "-1"],
  ])("Value [%s] [min=%s] [max=%s]", (val, minVal, maxVal, ariaVal) => {
    min(minVal);
    max(maxVal);
    value(val);
    expect(button.getAttribute("aria-valuenow")).toBe(ariaVal);
  });

  test("Update text", () => {
    fireEvent.change(text, { target: { value: "1" } });
    expect(value()).toBe(1);
  });

  test.each([
    [null, null, -1, 0],
    [2, null, -2, 0],
    [2.5, 2, -2.5, 0],
    [2.5, null, -3, -1],
  ])(
    "Control click [step=%s] [round=%s]",
    async (stepVal, roundVal, decreased, increased) => {
      step(stepVal);
      scale(roundVal);

      await userEvent.click(controls[0]);
      expect(value()).toBe(decreased);

      await userEvent.click(controls[1]);
      expect(value()).toBe(increased);
    }
  );

  test.each([
    ["{ArrowDown}", -1],
    ["{ArrowUp}", 1],
    ["{PageDown}", -10],
    ["{PageUp}", 10],
  ])("Keydown [%s]", async (key, expected) => {
    min(-10);
    max(10);
    text.focus();

    await userEvent.keyboard(key);
    expect(value()).toBe(expected);
  });
});
