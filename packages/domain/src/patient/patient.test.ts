import { describe, expect, it } from "vitest";
import { Patient } from "../index.js";

describe("Patient registration", () => {
  it("registers a patient with normalized demographics", () => {
    const patient = Patient.register({
      id: "patient-test-001",
      identifiers: [
        {
          system: "urn:benh-vien-so:mrn",
          value: " MRN-001 ",
          type: "hospital-mrn"
        }
      ],
      fullName: "  Nguyen   Van   A  ",
      managingOrganizationId: "hospital-demo"
    });

    expect(patient.toSnapshot()).toMatchObject({
      id: "patient-test-001",
      fullName: "Nguyen Van A",
      gender: "unknown",
      status: "active"
    });
  });

  it("rejects duplicate identifiers inside one patient record", () => {
    expect(() =>
      Patient.register({
        id: "patient-test-duplicate-identifier",
        identifiers: [
          {
            system: "urn:gov:vietnam:national-id",
            value: "000000000099",
            type: "national-id"
          },
          {
            system: "urn:gov:vietnam:national-id",
            value: "000000000099",
            type: "national-id"
          }
        ],
        fullName: "Duplicate Identifier",
        managingOrganizationId: "hospital-demo"
      })
    ).toThrow();
  });
});
