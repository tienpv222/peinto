import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import { $, batch, render } from "voby";
import { Button } from "./Button";

describe("Button", () => {
  const label = $("");
  const disabled = $(false);
  let activation = "";

  render(
    <Button
      label={label}
      disabled={disabled}
      onActivate={(event) => {
        activation = event.type;
      }}
    />,
    document.body
  );

  const button = document.querySelector("button")!;

  beforeEach(() => {
    batch(() => {
      label("");
      disabled(false);
      activation = "";
    });
  });

  test("Roles", () => {
    expect(button.getAttribute("role")).toBe("button");
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
    [true, "true"],
    [false, null],
  ])("Disabled [%s]", (value, expected) => {
    disabled(value);
    expect(button.getAttribute("aria-disabled")).toBe(expected);
  });

  test.each([
    [false, "click"],
    [true, ""],
  ])("Click [disabled=%s]", async (isDisabled, event) => {
    disabled(isDisabled);

    await userEvent.click(button);
    expect(activation).toBe(event);
  });

  test.each([
    ["{ }", "keydown"],
    ["{Enter}", "keydown"],
    ["{a}", ""],
  ])("Keydown [%s]", async (key, event) => {
    button.focus();

    disabled(true);
    await userEvent.keyboard(key);
    expect(activation).toBe("");

    disabled(false);
    await userEvent.keyboard(key);
    expect(activation).toBe(event);
  });
});
