import { describe, expect, it } from "vitest";
import { buildWiiiCareCapabilityStatement } from "./build-capability-statement.js";

describe("buildWiiiCareCapabilityStatement", () => {
  it("declares the WiiiCare Nexus FHIR R4 facade capabilities", () => {
    const capabilityStatement = buildWiiiCareCapabilityStatement({
      generatedAt: new Date("2026-05-28T00:00:00.000Z"),
      implementationUrl: "http://localhost:7310/api/v1",
      version: "0.2.0"
    });

    expect(capabilityStatement).toMatchObject({
      resourceType: "CapabilityStatement",
      id: "wiiicare-nexus-fhir-r4",
      status: "draft",
      kind: "instance",
      fhirVersion: "4.0.1",
      format: ["json"],
      implementation: {
        url: "http://localhost:7310/api/v1"
      }
    });
    expect(capabilityStatement.date).toBe("2026-05-28T00:00:00.000Z");
    expect(capabilityStatement.rest[0]?.mode).toBe("server");
    expect(capabilityStatement.rest[0]?.security?.description).toContain(
      "x-purpose-of-use"
    );
    expect(capabilityStatement.rest[0]?.resource).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "Patient",
          interaction: [{ code: "read" }, { code: "search-type" }]
        }),
        expect.objectContaining({
          type: "DocumentReference",
          interaction: [{ code: "read" }]
        }),
        expect.objectContaining({
          type: "Provenance",
          profile: "http://hl7.org/fhir/StructureDefinition/Provenance"
        }),
        expect.objectContaining({
          type: "Bundle",
          profile: "http://hl7.org/fhir/StructureDefinition/Bundle"
        }),
        expect.objectContaining({
          type: "AuditEvent",
          documentation: expect.stringContaining("integrity hash")
        })
      ])
    );
  });
});
