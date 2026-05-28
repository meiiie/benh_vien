import { isIP } from "node:net";

export function isLocalOnlyHostname(hostname: string): boolean {
  const normalizedHostname = hostname.trim().toLowerCase();

  if (
    normalizedHostname === "localhost" ||
    normalizedHostname.endsWith(".localhost")
  ) {
    return true;
  }

  const ipAddress = stripIpv6Brackets(normalizedHostname);
  const ipVersion = isIP(ipAddress);

  if (ipVersion === 4) {
    return isLoopbackOrPrivateIpv4(ipAddress);
  }

  if (ipVersion === 6) {
    return isLoopbackOrPrivateIpv6(ipAddress);
  }

  return false;
}

function stripIpv6Brackets(hostname: string): string {
  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    return hostname.slice(1, -1);
  }

  return hostname;
}

function isLoopbackOrPrivateIpv4(ipAddress: string): boolean {
  const octets = ipAddress.split(".").map((octet) => Number.parseInt(octet, 10));

  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet))) {
    return false;
  }

  const [first, second] = octets;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254)
  );
}

function isLoopbackOrPrivateIpv6(ipAddress: string): boolean {
  if (ipAddress === "::" || ipAddress === "::1") {
    return true;
  }

  const ipv4MappedAddress = parseIpv4MappedIpv6Address(ipAddress);

  if (ipv4MappedAddress) {
    return isLoopbackOrPrivateIpv4(ipv4MappedAddress);
  }

  const firstHextet = Number.parseInt(ipAddress.split(":")[0] || "0", 16);

  if (!Number.isInteger(firstHextet)) {
    return false;
  }

  return (
    (firstHextet & 0xfe00) === 0xfc00 ||
    (firstHextet & 0xffc0) === 0xfe80
  );
}

function parseIpv4MappedIpv6Address(ipAddress: string): string | undefined {
  const prefix = "::ffff:";

  if (!ipAddress.startsWith(prefix)) {
    return undefined;
  }

  const parts = ipAddress.slice(prefix.length).split(":");

  if (parts.length !== 2) {
    return undefined;
  }

  const high = Number.parseInt(parts[0], 16);
  const low = Number.parseInt(parts[1], 16);

  if (
    !Number.isInteger(high) ||
    !Number.isInteger(low) ||
    high < 0 ||
    high > 0xffff ||
    low < 0 ||
    low > 0xffff
  ) {
    return undefined;
  }

  return [
    (high >> 8) & 0xff,
    high & 0xff,
    (low >> 8) & 0xff,
    low & 0xff
  ].join(".");
}
