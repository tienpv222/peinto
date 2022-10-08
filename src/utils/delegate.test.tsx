import { test, expect } from "vitest";
import { render } from "voby";
import { delegate } from "./delegate";

test("Delegate event", async () => {
  let currentTag = "";

  const onClick = (event: Event, tag: string, cancelBubble?: boolean) => {
    currentTag = tag;
    event.cancelBubble = !!cancelBubble;
  };

  const dispose = render(
    <h1 ref={delegate("click", onClick, "h1")}>
      <h2 ref={delegate("click", onClick, "h2", true)}>
        <h3 ref={delegate("click", onClick, "h3")} />
      </h2>
    </h1>,
    document.body
  );

  await null;

  const h1 = document.querySelector("h1")!;
  const h2 = document.querySelector("h2")!;
  const h3 = document.querySelector("h3")!;

  h1.click();
  expect(currentTag).toBe("h1");

  h2.click();
  expect(currentTag).toBe("h2");

  h3.click();
  expect(currentTag).toBe("h2");

  dispose();
});
