import baseX from "base-x";
import murmur from "murmur-32";

export const BASE62 =
  "0123456789" + // @style: line-break
  "abcdefghijklmnopqrstuvwxyz" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const base62 = baseX(BASE62);

export const hashNumber = (value: number) => {
  return base62.encode(new Uint8Array([value]));
};

export const hashString = (value: string) => {
  const buffer = murmur(value);
  return base62.encode(new Uint8Array(buffer));
};
