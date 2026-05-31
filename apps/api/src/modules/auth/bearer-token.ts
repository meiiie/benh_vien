export function readBearerToken(value: string | string[] | undefined): string | undefined {
  const header = Array.isArray(value) ? value[0] : value;
  const match = /^Bearer\s+(.+)$/i.exec(header?.trim() ?? "");

  return match?.[1]?.trim() || undefined;
}
