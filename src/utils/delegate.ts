import { OmitFirstArg } from "./common";

const delegateds = new Set<string>();

const handlers = new WeakMap<EventTarget, Map<string, [Function, any[]][]>>();

export const delegate = <T extends (event: Event, ...args: any) => any>(
  type: string,
  handler: T,
  ...args: OmitFirstArg<T>
) => {
  if (!delegateds.has(type)) {
    document.addEventListener(type, onDelegate);
    delegateds.add(type);
  }

  return (element: HTMLElement) => {
    let handlerMap = handlers.get(element);
    if (!handlerMap) {
      handlerMap = new Map();
      handlers.set(element, handlerMap);
    }

    let handleList = handlerMap.get(type);
    if (!handleList) {
      handleList = [];
      handlerMap.set(type, handleList);
    }

    handleList.push([handler, args]);
  };
};

const onDelegate = (event: Event) => {
  for (const target of event.composedPath()) {
    const handlerList = handlers.get(target)?.get(event.type);
    if (!handlerList) continue;

    handlerList.forEach(runHandler, event);
    if (event.cancelBubble) break;
  }
};

function runHandler(this: Event, [handle, args]: [Function, any[]]) {
  handle(this, ...args);
}
