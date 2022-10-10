/** VARS */

const BUBBLES = Symbol();
const HANDLERS = Symbol();

let delegateds: Record<string, true | undefined> = {};

/** TYPES */

declare global {
  interface EventTarget {
    [BUBBLES]?: Record<string, true | undefined>;
    [HANDLERS]?: Record<string, [Function, any[]][] | undefined>;
  }
}

/** METHODS */

const onDelegate = (event: Event) => {
  const { type } = event;

  for (const target of event.composedPath()) {
    const handlerList = target[HANDLERS]?.[type];
    if (!handlerList) continue;

    for (const [handle, args = []] of handlerList) {
      handle.call(event, ...args);
    }

    if (!target[BUBBLES]?.[type]) break;
  }
};

export const delegate = <T extends (this: Event, ...args: any) => any>(
  type: string,
  handler: T,
  ...args: Parameters<T>
) => {
  if (!delegateds[type]) {
    document.addEventListener(type, onDelegate);
    delegateds[type] = true;
  }

  return (target: EventTarget) => {
    const handlers = target[HANDLERS] ?? (target[HANDLERS] = {});
    const handlerList = handlers[type] ?? (handlers[type] = []);

    handlerList.push([handler, args]);
  };
};

export const bubble = (type: string) => {
  return (target: EventTarget) => {
    const bubbles = target[BUBBLES] ?? (target[BUBBLES] = {});
    bubbles[type] = true;
  };
};

export const clearDelegateds = () => {
  for (const type in delegateds) {
    document.removeEventListener(type, onDelegate);
  }

  delegateds = {};
};
