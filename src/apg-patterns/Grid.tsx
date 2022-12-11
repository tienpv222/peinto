import { batch, createContext, FunctionMaybe, h, store } from "voby";
import { JoinAfter, Nullable } from "/src/utils/common";
import { PolyProps } from "/src/utils/voby";

/** VARS */

const GridContext = createContext<Context>();

/** TYPES */

type Context = {
  selecteds: Partial<Record<string, true>>;

  label: FunctionMaybe<string>;
  onChange?: Nullable<(value: string[]) => void>;
};

export type GridProviderProps = JoinAfter<
  Omit<Context, "selecteds">,
  {
    value?: FunctionMaybe<Nullable<readonly string[]>>;
    children?: JSX.Element;
  }
>;

export type GridRowProps<T> = PolyProps<
  T,
  { value?: FunctionMaybe<Nullable<string>> }
>;

export type GridCellProps<T> = PolyProps<T>;

/** METHODS */

const setValue = (ctx: Context, value: string[]) => {
  batch(() => {
    store.reconcile(
      ctx.selecteds,
      Object.fromEntries(value.map((key) => [key, true] as const))
    );

    ctx.onChange?.([...value]);
  });
};

/** COMPONENTS */

export const GridProvider = (props: GridProviderProps) => {
  const { children, ...rest } = props;

  const ctx: Context = {
    ...rest,
    selecteds: store({}),
  };

  return h(GridContext.Provider, {
    value: ctx,
    children,
  });
};

export const GridRow = () => {};

export const GridCell = () => {};
