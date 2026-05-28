import { describe, expect, it } from "vitest";
import { demoPasswordHash, dummyPasswordHash, verifyPassword } from "./auth-password.js";

describe("auth password verification", () => {
  it("verifies the demo password with scrypt hashes", async () => {
    await expect(verifyPassword("demo", demoPasswordHash)).resolves.toBe(true);
  });

  it("rejects invalid passwords without exposing plaintext comparison", async () => {
    await expect(verifyPassword("wrong-password", demoPasswordHash)).resolves.toBe(false);
    await expect(verifyPassword("wrong-password", dummyPasswordHash)).resolves.toBe(false);
  });
});
