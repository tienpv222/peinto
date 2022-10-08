import { OptionalArgs } from "./common";

declare global {
  interface Event {
    [BUBBLE]?: true;
  }

  interface EventTarget {
    [HANDLERS]?: Record<string, Handler[] | undefined>;
  }
}

type Handler = [handle: Function, args?: any[], bubble?: boolean];

const BUBBLE = Symbol();
const HANDLERS = Symbol();

const delegateds: string[] = [];

export const delegate = <T extends (this: Event, ...args: any) => any>(
  type: string,
  handler: T,
  ...[args, bubble]: true extends OptionalArgs<Parameters<T>>
    ? [args?: Parameters<T>, bubble?: boolean]
    : [args: Parameters<T>, bubble?: boolean]
) => {
  if (!delegateds.includes(type)) {
    document.addEventListener(type, onDelegate);
    delegateds.push(type);
  }

  return (target: EventTarget) => {
    const handlers = target[HANDLERS] ?? (target[HANDLERS] = {});
    const handlerList = handlers[type] ?? (handlers[type] = []);

    handlerList.push([handler, args, bubble]);
  };
};

const onDelegate = (event: Event) => {
  for (const target of event.composedPath()) {
    const handlerList = target[HANDLERS]?.[event.type];
    if (!handlerList) continue;

    handlerList.forEach(runHandler, event);
    if (!event[BUBBLE]) break;
  }
};

function runHandler(this: Event, [handle, args = [], bubble]: Handler) {
  handle.call(this, ...args);
  this[BUBBLE] = bubble || this[BUBBLE];
}
