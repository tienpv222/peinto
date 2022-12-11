import { SelectorFunction } from "oby/dist/types";
import { hash } from "ohash";
import {
  $$,
  createContext,
  FunctionMaybe,
  h,
  If,
  useContext,
  useEffect,
  useSelector,
} from "voby";
import { assumeType, createId, JoinAfter, Nullable } from "/src/utils/common";
import {
  Component,
  Control,
  ControlMaybe,
  joinRefs,
  PolyProps,
  useControl,
} from "/src/utils/voby";
import { ariaDisabled, ariaLabel, ariaOrientation } from "/src/utils/wai-aria";

/** VARS */

const DATA_SELECTED = "data-selected";

const TabsContext = createContext<Context>();

const tabValues = new WeakMap<HTMLElement, string>();

/** TYPES */

type Context = {
  id: string;
  value: Control<string>;
  selector: SelectorFunction<string>;

  label: FunctionMaybe<string>;
  vertical?: FunctionMaybe<Nullable<boolean>>;
  manualActivate?: FunctionMaybe<Nullable<boolean>>;
};

export type TabProviderProps = JoinAfter<
  Omit<Context, "id" | "value" | "selector">,
  {
    value: ControlMaybe<string>;
    children?: JSX.Element;
  }
>;

export type TabListProps<T> = PolyProps<T>;

export type TabProps<T> = PolyProps<
  T,
  {
    value: string;
    disabled?: FunctionMaybe<Nullable<boolean>>;
  }
>;

export type TabPanelProps<T> = PolyProps<T, { value: string }>;

export type TabPanelAs = Component<{
  [DATA_SELECTED]: () => boolean;
}>;

/** METHODS */

const getIds = ({ id }: Context, value: string) => {
  const hashed = hash(value);

  return {
    tabId: `_Tab_${id}_${hashed}`,
    panelId: `_TabPanel_${id}_${hashed}`,
  };
};

/** COMPONENTS */

export const TabProvider = (props: TabProviderProps) => {
  const { value, children, ...rest } = props;
  const ctxValue = useControl(value);

  const ctx: Context = {
    ...rest,
    id: createId(),
    value: ctxValue,
    selector: useSelector(ctxValue),
  };

  return h(TabsContext.Provider, { value: ctx, children });
};

export const TabList = <T extends Component = "ul">(props: TabListProps<T>) => {
  const ctx = useContext(TabsContext)!;
  const { as, ...rest } = props;

  return h(as ?? "ul", {
    ...rest,
    tabIndex: -1,

    role: "tablist",
    ...ariaLabel(ctx.label),
    ...ariaOrientation(ctx.vertical),
  });
};

export const Tab = <T extends Component = "li">(props: TabProps<T>) => {
  const ctx = useContext(TabsContext)!;
  const { as, value, disabled, ...rest } = props;

  const selected = ctx.selector(value);
  const { tabId, panelId } = getIds(ctx, value);

  return h(as ?? "li", {
    ...rest,

    ref: joinRefs((el) => {
      tabValues.set(el, value);

      useEffect(() => {
        $$(disabled) && el.blur();
      });
    }, rest.ref),

    id: tabId,
    tabIndex: () => (selected() ? 0 : -1),

    role: "tab",
    "aria-controls": panelId,
    "aria-selected": () => String(selected()),
    ...ariaDisabled(disabled),

    onClick() {
      if ($$(disabled)) return;
      ctx.value(value);
    },

    onKeyDown({ key, target }: KeyboardEvent) {
      assumeType<HTMLElement>(target);

      if (key === " " || key === "Enter") {
        ctx.value(value);
        return;
      }

      const direction = {
        ArrowUpfalse: -1,
        ArrowDownfalse: 1,
        ArrowLefttrue: -1,
        ArrowRighttrue: 1,
      }[key + !$$(ctx.vertical)];

      if (!direction) return;

      const pattern = `[id^=_Tab_${ctx.id}_]`;
      const tabEls = document.querySelectorAll<HTMLElement>(pattern);

      for (let i = 0, move = 0; ; i += move || 1) {
        if (!tabEls[i]) return;

        if (!move) {
          if (tabEls[i] === target) move = direction;
          continue;
        }

        if (tabEls[i].getAttribute("aria-disabled") === "true") continue;
        tabEls[i].focus();

        if ($$(ctx.manualActivate)) return;
        ctx.value(tabValues.get(tabEls[i])!);

        return;
      }
    },
  });
};

export const TabPanel = <T extends TabPanelAs = "section">(
  props: TabPanelProps<T>
) => {
  const ctx = useContext(TabsContext)!;
  const { as, value, children, ...rest } = props;

  const selected = ctx.selector(value);
  const { tabId, panelId } = getIds(ctx, value);

  return h(as ?? "section", {
    ...rest,
    id: panelId,

    role: "tabpanel",
    "aria-labelledby": tabId,
    [DATA_SELECTED]: selected,

    children: h(If, {
      when: selected,
      children,
    }),
  });
};
