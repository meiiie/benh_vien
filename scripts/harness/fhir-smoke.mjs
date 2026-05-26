import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const domainEntry = resolve("packages/domain/dist/index.js");

if (!existsSync(domainEntry)) {
  throw new Error("packages/domain/dist/index.js was not found. Run `pnpm build` first.");
}

const { Patient, mapPatientToFhir } = await import(pathToFileURL(domainEntry).href);

const patient = Patient.register({
  id: "patient-harness-001",
  identifiers: [
    {
      system: "urn:benh-vien-so:mrn",
      value: "MRN-HARNESS-001",
      type: "hospital-mrn"
    }
  ],
  fullName: "Nguyen Van Harness",
  birthDate: "1990-01-01",
  gender: "male",
  managingOrganizationId: "hospital-hai-phong-demo"
});

const fhirPatient = mapPatientToFhir(patient);

if (fhirPatient.resourceType !== "Patient") {
  throw new Error(`Expected resourceType Patient, received ${fhirPatient.resourceType}`);
}

if (fhirPatient.id !== "patient-harness-001") {
  throw new Error(`Expected id patient-harness-001, received ${fhirPatient.id}`);
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "FHIR Patient mapping smoke test",
      patientId: fhirPatient.id,
      resourceType: fhirPatient.resourceType
    },
    null,
    2
  )
);

