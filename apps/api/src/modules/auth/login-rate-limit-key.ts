import { createHash } from "node:crypto";

export function createLoginRateLimitKey(ipAddress: string, username: string): string {
  return createHash("sha256")
    .update(ipAddress)
    .update("\0")
    .update(username.trim().toLowerCase())
    .digest("hex");
}
