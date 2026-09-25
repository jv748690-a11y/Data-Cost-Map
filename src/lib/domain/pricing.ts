const MB_PER_GB = 1024;

export function pricePerGb(priceMinor: number, dataMb: number): number {
  if (!Number.isInteger(priceMinor) || priceMinor <= 0) {
    throw new Error("priceMinor must be a positive integer");
  }
  if (!Number.isInteger(dataMb) || dataMb <= 0) {
    throw new Error("dataMb must be a positive integer");
  }
  return Math.round((priceMinor / dataMb) * MB_PER_GB);
}