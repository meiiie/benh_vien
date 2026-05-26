import type { FhirPatient } from "./fhir-types.js";
import type { Patient, PatientIdentifierType } from "../patient/patient.js";

const identifierLabels: Record<PatientIdentifierType, string> = {
  "national-id": "Số định danh cá nhân",
  "insurance-id": "Mã bảo hiểm y tế",
  "hospital-mrn": "Mã hồ sơ tại bệnh viện",
  "legacy-id": "Mã hệ thống cũ"
};

export function mapPatientToFhir(patient: Patient): FhirPatient {
  const snapshot = patient.toSnapshot();

  return {
    resourceType: "Patient",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Patient"]
    },
    identifier: snapshot.identifiers.map((identifier) => ({
      system: identifier.system,
      value: identifier.value,
      type: {
        text: identifierLabels[identifier.type]
      }
    })),
    active: snapshot.status === "active",
    name: [
      {
        text: snapshot.fullName
      }
    ],
    gender: snapshot.gender,
    birthDate: snapshot.birthDate,
    telecom: snapshot.phone
      ? [
          {
            system: "phone",
            value: snapshot.phone,
            use: "mobile"
          }
        ]
      : undefined,
    address: snapshot.address
      ? [
          {
            text: snapshot.address
          }
        ]
      : undefined,
    managingOrganization: {
      reference: `Organization/${snapshot.managingOrganizationId}`
    }
  };
}

