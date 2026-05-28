import { describe, expect, it } from "vitest";
import {
  recordTransferEndpointNotAllowedError,
  validateRecordTransferEndpointForDelivery
} from "./record-transfer-endpoint-policy.js";

describe("record transfer endpoint policy", () => {
  it("allows HTTP endpoints outside production for local interop labs", () => {
    expect(
      validateRecordTransferEndpointForDelivery({
        endpointAddress: "http://localhost:8090/fhir",
        nodeEnv: "development"
      })
    ).toEqual({
      allowed: true
    });
  });

  it("requires HTTPS endpoints in production", () => {
    expect(
      validateRecordTransferEndpointForDelivery({
        endpointAddress: "http://fhir.referral.demo.wiiicare.vn/fhir",
        nodeEnv: "production"
      })
    ).toEqual({
      allowed: false,
      error: recordTransferEndpointNotAllowedError,
      message: "Trong production, endpoint FHIR nhận hồ sơ bệnh án phải dùng HTTPS."
    });
  });

  it.each([
    "https://localhost/fhir",
    "https://gateway.localhost/fhir",
    "https://127.0.0.1/fhir",
    "https://0.0.0.0/fhir",
    "https://[::1]/fhir",
    "https://10.0.0.5/fhir",
    "https://172.16.0.5/fhir",
    "https://172.31.255.250/fhir",
    "https://192.168.1.25/fhir",
    "https://169.254.10.20/fhir",
    "https://[fc00::1]/fhir",
    "https://[fd12:3456::1]/fhir",
    "https://[fe80::1]/fhir",
    "https://[::ffff:192.168.1.25]/fhir"
  ])("rejects loopback and local-only endpoints in production: %s", (endpointAddress) => {
    expect(
      validateRecordTransferEndpointForDelivery({
        endpointAddress,
        nodeEnv: "production"
      })
    ).toEqual({
      allowed: false,
      error: recordTransferEndpointNotAllowedError,
      message:
        "Trong production, endpoint FHIR nhận hồ sơ bệnh án không được dùng localhost, loopback hoặc địa chỉ chỉ dùng nội bộ máy."
    });
  });

  it("allows HTTPS non-loopback endpoints in production", () => {
    expect(
      validateRecordTransferEndpointForDelivery({
        endpointAddress: "https://fhir.referral.demo.wiiicare.vn/fhir",
        nodeEnv: "production"
      })
    ).toEqual({
      allowed: true
    });
  });
});
