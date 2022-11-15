import { DragGesture } from "@use-gesture/vanilla";
import { $, useCleanup } from "voby";
import css from "./NumberInput.module.scss";
import { Spin } from "/src/apg-patterns/Spinbutton";

/** VARS */

export const DATA_VALUE = "--value";

/** TYPES */

export type NumberInputProps = {
  label: string;
  value: () => number;
  min?: number;
  max: number;
  unit?: string;
  class?: string;
  onChange(value: number): void;
};

/** COMPONENTS */

export const NumberInput = (props: NumberInputProps) => {
  const { class: class_, unit, ...rest } = props;
  const { value, min = 0, max, onChange } = rest;
  const disabled = $(false);

  return (
    <label class={[css.NumberInput, class_]}>
      <span children={rest.label} />

      <Spin.Button
        {...rest}
        min={min}
        round={0}
        style={{
          [DATA_VALUE]: () => `${(value() / (max - min)) * 100}%`,
        }}
      >
        <span
          ref={(el) => {
            const gesture = new DragGesture(el, ({ first, last, delta }) => {
              let newVal = value() + (delta[0] * (max - min)) / 100;
              newVal = Math.max(newVal, min);
              newVal = Math.min(newVal, max);
              onChange(newVal);

              if (first) disabled(true);
              if (last) setTimeout(disabled, 0, false);
            });

            useCleanup(() => gesture.destroy());
          }}
          children={unit ?? "\u00A0"}
        />

        <Spin.Text disabled={disabled} />

        <div>
          <Spin.Increment />
          <Spin.Decrement />
        </div>
      </Spin.Button>
    </label>
  );
};
