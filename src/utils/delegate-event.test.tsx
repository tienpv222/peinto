import { expect, test } from "vitest";
import { render } from "voby";
import { delegate } from "./delegate-event";

test("Delegate event", async () => {
  let currentTag = "";
  let h3Clicked = false;

  function onClick(this: Event, tag: string) {
    currentTag = tag;
  }

  const dispose = render(
    <h1 ref={delegate("click", onClick, ["h1"])}>
      <h2 ref={delegate("click", onClick, ["h2"], true)}>
        <h3
          ref={[
            delegate("click", () => (h3Clicked = true), undefined, true),
            delegate("click", onClick, ["h3"]),
          ]}
        >
          <h4 ref={delegate("click", onClick, ["h4"])} />
        </h3>
      </h2>
    </h1>,
    document.body
  );

  await null;

  const h1 = document.querySelector("h1")!;
  const h2 = document.querySelector("h2")!;
  const h3 = document.querySelector("h3")!;
  const h4 = document.querySelector("h4")!;

  h1.click();
  expect(currentTag).toBe("h1");

  h2.click();
  expect(currentTag).toBe("h1");

  h3.click();
  expect(currentTag).toBe("h1");
  expect(h3Clicked).toBe(true);

  h4.click();
  expect(currentTag).toBe("h4");

  dispose();
});
