import { describe, expect, it } from "vitest";
import { isLocalOnlyHostname } from "./local-only-hostname.js";

describe("local-only hostname policy", () => {
  it.each([
    "localhost",
    "gateway.localhost",
    "127.0.0.1",
    "0.0.0.0",
    "10.0.0.5",
    "172.16.0.5",
    "172.31.255.250",
    "192.168.1.25",
    "169.254.10.20",
    "::",
    "::1",
    "[::1]",
    "fc00::1",
    "fd12:3456::1",
    "fe80::1",
    "::ffff:c0a8:0119",
    "::ffff:192.168.1.25",
    "[::ffff:192.168.1.25]"
  ])("treats local-only hostnames as private: %s", (hostname) => {
    expect(isLocalOnlyHostname(hostname)).toBe(true);
  });

  it.each([
    "fhir.referral.demo.wiiicare.vn",
    "8.8.8.8",
    "172.32.0.1",
    "192.169.0.1",
    "2001:4860:4860::8888",
    "::ffff:0808:0808"
  ])("allows public hostnames: %s", (hostname) => {
    expect(isLocalOnlyHostname(hostname)).toBe(false);
  });
});
