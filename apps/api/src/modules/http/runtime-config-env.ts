export function readPositiveIntegerEnv(name: string, defaultValue: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return defaultValue;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}

export function readBoundedIntegerEnv(
  name: string,
  defaultValue: number,
  minValue: number,
  maxValue: number
): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return defaultValue;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < minValue || value > maxValue) {
    throw new Error(`${name} must be an integer between ${minValue} and ${maxValue}.`);
  }

  return value;
}

export function readBooleanEnv(name: string, defaultValue: boolean): boolean {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return defaultValue;
  }

  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  throw new Error(`${name} must be either 'true' or 'false'.`);
}
