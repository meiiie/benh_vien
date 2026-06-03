import type { CreateProcedureRequest } from "@benh-vien-so/contracts";
import type {
  ClinicalDocumentRepository,
  ConditionRepository,
  DiagnosticReportRepository,
  EncounterRepository,
  ProcedureRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import { describe, expect, it, vi } from "vitest";
import { validateProcedureReferences } from "./procedure-reference-validation.js";

type PatientOwnedResource = {
  readonly patientId: string;
};

const baseCommand: CreateProcedureRequest = {
  status: "completed",
  category: "diagnostic",
  code: {
    system: "http://snomed.info/sct",
    code: "168537006",
    display: "Chest X-ray"
  }
};

describe("validateProcedureReferences", () => {
  it("rejects patient-owned references from another patient", async () => {
    const repositories = createRepositories({
      encounter: { patientId: "patient-demo-001" },
      serviceRequest: { patientId: "patient-other-001" },
      procedure: { patientId: "patient-demo-001" },
      condition: { patientId: "patient-demo-001" }
    });

    const error = await validateProcedureReferences({
      patientId: "patient-demo-001",
      command: {
        ...baseCommand,
        encounterId: "encounter-demo-001",
        basedOnServiceRequestId: "service-request-other-001",
        partOfProcedureId: "procedure-demo-001",
        reasonConditionId: "condition-demo-001"
      },
      ...repositories
    });

    expect(error).toEqual({
      error: "SERVICE_REQUEST_MISMATCH",
      message: "Procedure phải tham chiếu ServiceRequest thuộc cùng bệnh nhân."
    });
  });

  it("accepts omitted patient-owned references", async () => {
    const repositories = createRepositories({});

    const error = await validateProcedureReferences({
      patientId: "patient-demo-001",
      command: baseCommand,
      ...repositories
    });

    expect(error).toBeUndefined();
    expect(repositories.encounterRepository.findById).not.toHaveBeenCalled();
    expect(repositories.serviceRequestRepository.findById).not.toHaveBeenCalled();
    expect(repositories.procedureRepository.findById).not.toHaveBeenCalled();
    expect(repositories.conditionRepository.findById).not.toHaveBeenCalled();
  });
});

function createRepositories(resources: {
  readonly encounter?: PatientOwnedResource;
  readonly serviceRequest?: PatientOwnedResource;
  readonly procedure?: PatientOwnedResource;
  readonly condition?: PatientOwnedResource;
}): {
  readonly encounterRepository: EncounterRepository;
  readonly serviceRequestRepository: ServiceRequestRepository;
  readonly procedureRepository: ProcedureRepository;
  readonly conditionRepository: ConditionRepository;
  readonly diagnosticReportRepository: DiagnosticReportRepository;
  readonly clinicalDocumentRepository: ClinicalDocumentRepository;
} {
  return {
    encounterRepository: asRepository<EncounterRepository>(resources.encounter),
    serviceRequestRepository: asRepository<ServiceRequestRepository>(
      resources.serviceRequest
    ),
    procedureRepository: asRepository<ProcedureRepository>(resources.procedure),
    conditionRepository: asRepository<ConditionRepository>(resources.condition),
    diagnosticReportRepository: asRepository<DiagnosticReportRepository>(undefined),
    clinicalDocumentRepository: asRepository<ClinicalDocumentRepository>(undefined)
  };
}

function asRepository<Repository>(resource: PatientOwnedResource | undefined): Repository {
  return patientOwnedRepository(resource) as unknown as Repository;
}

function patientOwnedRepository(resource: PatientOwnedResource | undefined): {
  readonly findById: ReturnType<typeof vi.fn>;
} {
  return {
    findById: vi.fn(async () => resource)
  };
}
