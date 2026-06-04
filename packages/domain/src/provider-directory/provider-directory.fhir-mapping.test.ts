import { describe, expect, it } from "vitest";
import { mapProviderDirectoryToFhirBundle } from "../fhir/map-provider-directory-to-fhir.js";
import { assembleProviderDirectory } from "./provider-directory.test-support.js";

describe("ProviderDirectory FHIR mapping", () => {
  it("exports FHIR directory resources for organizations, practitioners, roles and endpoints", () => {
    const bundle = mapProviderDirectoryToFhirBundle(
      assembleProviderDirectory(),
      new Date("2026-05-28T02:00:00.000Z")
    );

    expect(bundle.resourceType).toBe("Bundle");
    expect(bundle.type).toBe("collection");
    expect(bundle.entry.map((entry) => entry.resource.resourceType)).toEqual([
      "Organization",
      "Organization",
      "Practitioner",
      "PractitionerRole",
      "Endpoint"
    ]);
    expect(bundle.entry.at(-1)?.resource).toMatchObject({
      resourceType: "Endpoint",
      connectionType: {
        code: "hl7-fhir-rest"
      }
    });
  });
});
