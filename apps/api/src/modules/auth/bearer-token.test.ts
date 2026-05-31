import { describe, expect, it } from "vitest";
import { readBearerToken } from "./bearer-token.js";

describe("readBearerToken", () => {
  it("accepts case-insensitive Bearer schemes and trims token whitespace", () => {
    expect(readBearerToken("Bearer access-token-001")).toBe("access-token-001");
    expect(readBearerToken("bearer   access-token-002  ")).toBe("access-token-002");
    expect(readBearerToken(["BEARER access-token-003"])).toBe("access-token-003");
  });

  it("rejects missing, malformed or empty bearer credentials", () => {
    expect(readBearerToken(undefined)).toBeUndefined();
    expect(readBearerToken("Basic access-token-001")).toBeUndefined();
    expect(readBearerToken("Bearer   ")).toBeUndefined();
  });
});
