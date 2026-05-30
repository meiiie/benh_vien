import { Patient, PatientIdentifierConflictError } from "@benh-vien-so/domain";
import type { PatientRepository } from "@benh-vien-so/domain";

export class InMemoryPatientRepository implements PatientRepository {
  private readonly patients = new Map<string, Patient>();

  constructor(seedPatients: readonly Patient[] = []) {
    for (const patient of seedPatients) {
      this.patients.set(patient.id, clonePatient(patient));
    }
  }

  async findAll(): Promise<Patient[]> {
    return [...this.patients.values()].map(clonePatient);
  }

  async findById(id: string): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    return patient ? clonePatient(patient) : undefined;
  }

  async findByIdentifier(identifier: {
    readonly system: string;
    readonly value: string;
  }): Promise<Patient | undefined> {
    for (const patient of this.patients.values()) {
      const snapshot = patient.toSnapshot();
      const matched = snapshot.identifiers.some(
        (current) =>
          current.system === identifier.system && current.value === identifier.value
      );

      if (matched) {
        return clonePatient(patient);
      }
    }

    return undefined;
  }

  async save(patient: Patient): Promise<void> {
    const snapshot = patient.toSnapshot();

    for (const identifier of snapshot.identifiers) {
      const existing = await this.findByIdentifier(identifier);

      if (existing && existing.id !== snapshot.id) {
        throw new PatientIdentifierConflictError({
          existingPatientId: existing.id,
          identifier
        });
      }
    }

    this.patients.set(patient.id, clonePatient(patient));
  }
}

export function createSeedPatients(): Patient[] {
  return [
    Patient.register({
      id: "patient-demo-001",
      identifiers: [
        {
          system: "urn:benh-vien-so:mrn",
          value: "MRN-HP-0001",
          type: "hospital-mrn"
        },
        {
          system: "urn:gov:vietnam:national-id",
          value: "000000000001",
          type: "national-id"
        }
      ],
      fullName: "Nguyễn Văn An",
      birthDate: "1988-04-12",
      gender: "male",
      address: "Hải Phòng, Việt Nam",
      phone: "0900000001",
      managingOrganizationId: "hospital-hai-phong-demo"
    })
  ];
}

function clonePatient(patient: Patient): Patient {
  return Patient.rehydrate(patient.toSnapshot());
}
