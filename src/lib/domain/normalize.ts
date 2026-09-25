const SIZE_UNITS: Record<string, number> = {
  mb: 1,
  gb: 1024,
  tb: 1024 * 1024,
};

export function parseDataSizeMb(input: string): number {
  const match = /^\s*(\d+(?:\.\d+)?)\s*(mb|gb|tb)\s*$/i.exec(input);
  if (!match) throw new Error(`Unrecognised data size: ${input}`);

  const mb = Math.round(parseFloat(match[1]) * SIZE_UNITS[match[2].toLowerCase()]);
  if (mb <= 0) throw new Error(`Data size must be positive: ${input}`);
  return mb;
}

export function parseValidityDays(input: string): number {
  const match = /^\s*(\d+)\s*(hours?|hrs?|days?|weeks?|months?)\s*$/i.exec(input);
  if (!match) throw new Error(`Unrecognised validity: ${input}`);

  const n = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  let days: number;
  if (unit.startsWith("h")) days = Math.ceil(n / 24);
  else if (unit.startsWith("d")) days = n;
  else if (unit.startsWith("w")) days = n * 7;
  else days = n * 30;

  if (days <= 0) throw new Error(`Validity must be positive: ${input}`);
  return days;
}