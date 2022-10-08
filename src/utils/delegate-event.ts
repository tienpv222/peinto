const BUBBLE = Symbol();
const HANDLERS = Symbol();

const delegateds = new Set<string>();

type Handler = [handle: Function, args?: any[], bubble?: boolean];

type DelegatedEvent = Omit<Event, "composedPath"> & {
  [BUBBLE]?: boolean;
  composedPath(): DelegatedTarget[];
};

type DelegatedTarget = EventTarget & {
  [HANDLERS]?: Record<string, Handler[] | undefined>;
};

export const delegate = <T extends (this: DelegatedEvent, ...args: any) => any>(
  type: string,
  handler: T,
  args?: Parameters<T>,
  bubble?: boolean
) => {
  if (!delegateds.has(type)) {
    document.addEventListener(type, onDelegate);
    delegateds.add(type);
  }

  return (target: DelegatedTarget) => {
    const handlers = target[HANDLERS] ?? (target[HANDLERS] = {});
    const handlerList = handlers[type] ?? (handlers[type] = []);

    handlerList.push([handler, args, bubble]);
  };
};

const onDelegate = (event: DelegatedEvent) => {
  for (const target of event.composedPath()) {
    const handlerList = target[HANDLERS]?.[event.type];
    if (!handlerList) continue;

    handlerList.forEach(runHandler, event);
    if (!event[BUBBLE]) break;
  }
};

function runHandler(
  this: DelegatedEvent,
  [handle, args = [], bubble]: Handler
) {
  setBubble(this, bubble);
  handle.call(this, ...args);
}

export const setBubble = (event: DelegatedEvent, bubble?: boolean) => {
  event[BUBBLE] = bubble ?? event[BUBBLE];
};
