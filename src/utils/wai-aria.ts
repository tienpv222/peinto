import { $$, FunctionMaybe } from "voby";
import { Nullable } from "./common";

export const ariaOrientation = (
  vertical?: FunctionMaybe<Nullable<boolean>>
) => {
  return {
    "aria-orientation": () => ($$(vertical) ? "vertical" : "horizontal"),
  };
};

export const ariaLabel = (label: FunctionMaybe<string>) => {
  const labelId = () => $$(label)[0] === "#";

  return {
    "aria-label": () => (labelId() ? null : $$(label)),
    "aria-labelledby": () => (labelId() ? $$(label).slice(1) : null),
  };
};
