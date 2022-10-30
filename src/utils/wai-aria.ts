import { $$, FunctionMaybe } from "voby";

export const ariaOrientation = (vertical?: FunctionMaybe<boolean>) => {
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
