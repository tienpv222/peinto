import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { render } from "voby";
import { bubble, clearDelegateds, delegate } from "./delegate-event";

const setup = async (
  renderFunc: (handler: (value: string) => any) => JSX.Element
) => {
  function handler(this: Event, value: string) {
    const target = this.target as HTMLElement;
    context.values.push(value);
    context.tags.push(target.tagName);
  }

  const dispose = render(renderFunc(handler), document.body);

  const context = {
    values: [] as string[],
    tags: [] as string[],
    reset() {
      context.values = [];
      context.tags = [];
    },
    clear() {
      dispose();
      clearDelegateds();
    },
  };

  return context;
};

test("Delegate events", async () => {
  const context = await setup((handler) => (
    <h1 ref={delegate("click", handler, "h1")}>
      <h2 ref={delegate("keypress", handler, "h2")}>
        <h3 ref={delegate("click", handler, "h3")}>
          <h4 ref={delegate("keypress", handler, "h4")} />
        </h3>
      </h2>
    </h1>
  ));

  const h1 = document.querySelector("h1")!;
  const h2 = document.querySelector("h2")!;
  const h3 = document.querySelector("h3")!;
  const h4 = document.querySelector("h4")!;

  await userEvent.click(h1);
  expect(context.values).toEqual(["h1"]);
  expect(context.tags).toEqual(["H1"]);

  context.reset();

  h2.focus();
  await userEvent.keyboard("a");
  expect(context.values).toEqual(["h2"]);
  expect(context.tags).toEqual(["H2"]);

  context.reset();

  await userEvent.click(h3);
  expect(context.values).toEqual(["h3"]);
  expect(context.tags).toEqual(["H3"]);

  context.reset();

  h4.focus();
  await userEvent.keyboard("a");
  expect(context.values).toEqual(["h4"]);
  expect(context.tags).toEqual(["H4"]);

  context.clear();
});

test("Bubble events", async () => {
  const context = await setup((handler) => (
    <h1 ref={delegate("click", handler, "h1")}>
      <h2 ref={delegate("keypress", handler, "h2")}>
        <h3 ref={[delegate("click", handler, "h3"), bubble("click")]}>
          <h4 ref={[delegate("keypress", handler, "h4"), bubble("keypress")]} />
        </h3>
      </h2>
    </h1>
  ));

  const h3 = document.querySelector("h3")!;
  const h4 = document.querySelector("h4")!;

  await userEvent.click(h3);
  expect(context.values).toEqual(["h3", "h1"]);
  expect(context.tags).toEqual(["H3", "H3"]);

  context.reset();

  h4.focus();
  await userEvent.keyboard("a");
  expect(context.values).toEqual(["h4", "h2"]);
  expect(context.tags).toEqual(["H4", "H4"]);

  context.clear();
});
