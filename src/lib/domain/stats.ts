export function median(values: number[]): number {
  if (values.length === 0) throw new Error("Cannot take the median of an empty list");
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function filterOutliers(values: number[]): number[] {
  if (values.length < 4) return values;

  const med = median(values);
  const mad = median(values.map((v) => Math.abs(v - med)));
  if (mad === 0) return values;

  return values.filter((v) => Math.abs(v - med) <= 3 * mad);
}