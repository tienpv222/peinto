import { expect, test } from "vitest";
import { $, batch } from "voby";
import { useTransform } from "./voby";

test("useTransform", () => {
  const value = $(0);
  const max = $(1);
  let run = 0;

  useTransform(
    value,
    (value, max) => {
      ++run;
      return Math.min(value, max);
    },
    max
  );

  expect(value()).toBe(0);
  expect(run).toBe(1);

  value(2);
  expect(value()).toBe(1);
  expect(run).toBe(2);

  max(0);
  expect(value()).toBe(0);
  expect(run).toBe(3);

  batch(() => {
    value(2);
    max(1);
  });
  expect(value()).toBe(1);
  expect(run).toBe(4);
});
