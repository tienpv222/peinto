import { DragGesture } from "@use-gesture/vanilla";
import { $, batch, useCleanup } from "voby";
import css from "./NumberInput.module.scss";
import {
  SpinButton,
  SpinDecrement,
  SpinIncrement,
  SpinText,
} from "/src/apg-patterns/Spinbutton";

/** VARS */

export const DATA_VALUE = "--value";

/** TYPES */

export type NumberInputProps = {
  label: string;
  value: () => number;
  min?: number;
  max: number;
  unit?: string;
  onChange(value: number): void;
};

type DragMemo = {
  initial: number;
  total: number;
};

/** COMPONENTS */

export const NumberInput = (props: NumberInputProps) => {
  const { min = 0, unit, ...rest } = props;
  const unrounded = $(rest.value());
  const dragging = $(false);
  const range = props.max - min;

  return (
    <label class={css.NumberInput}>
      <span children={rest.label} />

      <SpinButton
        {...rest}
        min={min}
        controlled
        style={{
          [DATA_VALUE]: () =>
            `${((dragging() ? unrounded() : rest.value()) / range) * 100}%`,
        }}
      >
        <span
          ref={(el) => {
            const gesture = new DragGesture(el, (state) => {
              const { first, last, movement } = state;
              const memo: DragMemo = state.memo ?? {
                total: el.parentElement!.offsetWidth / range,
                initial: rest.value(),
              };

              const value = memo.initial + movement[0] / memo.total;

              batch(() => {
                unrounded(value);
                rest.onChange(value);

                if (first) dragging(true);
                if (last) setTimeout(dragging, 0, false);
              });

              return memo;
            });

            useCleanup(() => gesture.destroy());
          }}
          children={unit ?? "\u00A0"}
        />

        <SpinText disabled={dragging} />

        <div>
          <SpinIncrement />
          <SpinDecrement />
        </div>
      </SpinButton>
    </label>
  );
};
