import { $$, FunctionMaybe } from "voby";
import { Nullable } from "./common";

export const ariaOrientation = (
  vertical?: FunctionMaybe<Nullable<boolean>>
) => {
  return {
    "aria-orientation": () => ($$(vertical) ? "vertical" : "horizontal"),
  };
};

export const ariaLabel = (value: FunctionMaybe<string>) => {
  const ref = () => $$(value)[0] === "#";

  return {
    "aria-label": () => (ref() ? null : $$(value)),
    "aria-labelledby": () => (ref() ? $$(value).slice(1) : null),
  };
};

export const ariaDisabled = (value?: FunctionMaybe<Nullable<boolean>>) => {
  return {
    "aria-disabled": () => ($$(value) ? "true" : null),
  };
};
