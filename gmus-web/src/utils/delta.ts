export function scrollThroughItems<T>(
  items: T[],
  predicate: (item: T) => boolean,
  delta: number,
): T {
  return items[Math.max(0, Math.min(items.length - 1, items.findIndex(predicate) + delta))];
}
