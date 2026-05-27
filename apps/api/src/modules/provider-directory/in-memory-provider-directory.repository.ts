import { ProviderDirectory } from "@benh-vien-so/domain";
import type { ProviderDirectoryRepository } from "@benh-vien-so/domain";

export class InMemoryProviderDirectoryRepository implements ProviderDirectoryRepository {
  private directory: ProviderDirectory;

  constructor(seedDirectory: ProviderDirectory = createSeedProviderDirectory()) {
    this.directory = cloneDirectory(seedDirectory);
  }

  async findDirectory(): Promise<ProviderDirectory> {
    return cloneDirectory(this.directory);
  }

  async save(directory: ProviderDirectory): Promise<void> {
    this.directory = cloneDirectory(directory);
  }
}

export function createSeedProviderDirectory(): ProviderDirectory {
  return ProviderDirectory.assemble({
    generatedAt: new Date("2026-05-28T00:00:00.000Z"),
    organizations: [
      {
        id: "hospital-hai-phong-demo",
        identifiers: [
          {
            system: "urn:wiiicare:nexus:organization-code",
            value: "HP-DEMO-HOSPITAL",
            type: "local-provider-code"
          }
        ],
        active: true,
        type: "hospital",
        name: "Bệnh viện số Hải Phòng",
        alias: ["WiiiCare Hải Phòng Demo"],
        address: "Hải Phòng, Việt Nam",
        telecom: [
          {
            system: "phone",
            value: "0225-000-000",
            use: "work"
          }
        ]
      },
      {
        id: "hospital-hai-phong-referral",
        identifiers: [
          {
            system: "urn:wiiicare:nexus:organization-code",
            value: "HP-REFERRAL-HOSPITAL",
            type: "local-provider-code"
          }
        ],
        active: true,
        type: "hospital",
        name: "Bệnh viện tiếp nhận Hải Phòng",
        address: "Hải Phòng, Việt Nam"
      },
      {
        id: "department-outpatient",
        identifiers: [],
        active: true,
        type: "department",
        name: "Khoa khám bệnh",
        partOfOrganizationId: "hospital-hai-phong-demo"
      },
      {
        id: "department-laboratory",
        identifiers: [],
        active: true,
        type: "laboratory",
        name: "Khoa xét nghiệm",
        partOfOrganizationId: "hospital-hai-phong-demo"
      },
      {
        id: "department-diagnostic-imaging",
        identifiers: [],
        active: true,
        type: "imaging",
        name: "Khoa chẩn đoán hình ảnh",
        partOfOrganizationId: "hospital-hai-phong-demo"
      }
    ],
    practitioners: [
      {
        id: "practitioner-demo-001",
        identifiers: [
          {
            system: "urn:wiiicare:nexus:practitioner-code",
            value: "BS-HP-001",
            type: "local-practitioner-code"
          }
        ],
        active: true,
        fullName: "Bác sĩ điều trị",
        qualification: "Bác sĩ đa khoa"
      },
      {
        id: "practitioner-demo-002",
        identifiers: [
          {
            system: "urn:wiiicare:nexus:practitioner-code",
            value: "BS-HP-002",
            type: "local-practitioner-code"
          }
        ],
        active: true,
        fullName: "Bác sĩ xét nghiệm",
        qualification: "Bác sĩ chuyên khoa xét nghiệm"
      },
      {
        id: "practitioner-demo-003",
        identifiers: [
          {
            system: "urn:wiiicare:nexus:practitioner-code",
            value: "BS-HP-003",
            type: "local-practitioner-code"
          }
        ],
        active: true,
        fullName: "Bác sĩ hồ sơ bệnh án",
        qualification: "Bác sĩ quản lý hồ sơ"
      },
      {
        id: "nurse-demo-001",
        identifiers: [
          {
            system: "urn:wiiicare:nexus:practitioner-code",
            value: "DD-HP-001",
            type: "local-practitioner-code"
          }
        ],
        active: true,
        fullName: "Điều dưỡng tiếp nhận",
        qualification: "Điều dưỡng"
      }
    ],
    endpoints: [
      {
        id: "endpoint-fhir-hai-phong-demo",
        managingOrganizationId: "hospital-hai-phong-demo",
        status: "active",
        connectionType: "hl7-fhir-rest",
        name: "FHIR Gateway Hải Phòng",
        address: "https://fhir.demo.wiiicare.vn/fhir",
        payloadTypes: [
          {
            system: "http://hl7.org/fhir/resource-types",
            code: "Bundle",
            display: "FHIR Bundle"
          },
          {
            system: "http://hl7.org/fhir/resource-types",
            code: "DocumentReference",
            display: "FHIR DocumentReference"
          }
        ]
      },
      {
        id: "endpoint-pacs-hai-phong-demo",
        managingOrganizationId: "department-diagnostic-imaging",
        status: "active",
        connectionType: "dicom-wado-rs",
        name: "PACS DICOMweb Hải Phòng",
        address: "https://pacs.demo.wiiicare.vn/dicom-web",
        payloadTypes: [
          {
            system: "http://hl7.org/fhir/resource-types",
            code: "ImagingStudy",
            display: "FHIR ImagingStudy"
          }
        ]
      },
      {
        id: "endpoint-lis-hai-phong-demo",
        managingOrganizationId: "department-laboratory",
        status: "test",
        connectionType: "hl7v2-mllp",
        name: "LIS HL7 v2 Hải Phòng",
        address: "mllp://lis.demo.wiiicare.vn:2575",
        payloadTypes: [
          {
            system: "urn:hl7-org:v2",
            code: "ORU_R01",
            display: "HL7 v2 Observation Result"
          }
        ]
      }
    ],
    practitionerRoles: [
      {
        id: "role-practitioner-demo-001",
        practitionerId: "practitioner-demo-001",
        organizationId: "department-outpatient",
        active: true,
        code: {
          system: "http://terminology.hl7.org/CodeSystem/practitioner-role",
          code: "doctor",
          display: "Doctor"
        },
        endpointIds: ["endpoint-fhir-hai-phong-demo"]
      },
      {
        id: "role-practitioner-demo-002",
        practitionerId: "practitioner-demo-002",
        organizationId: "department-laboratory",
        active: true,
        code: {
          system: "http://terminology.hl7.org/CodeSystem/practitioner-role",
          code: "doctor",
          display: "Doctor"
        },
        endpointIds: ["endpoint-lis-hai-phong-demo"]
      },
      {
        id: "role-practitioner-demo-003",
        practitionerId: "practitioner-demo-003",
        organizationId: "hospital-hai-phong-demo",
        active: true,
        code: {
          system: "http://terminology.hl7.org/CodeSystem/practitioner-role",
          code: "doctor",
          display: "Doctor"
        },
        endpointIds: ["endpoint-fhir-hai-phong-demo"]
      },
      {
        id: "role-nurse-demo-001",
        practitionerId: "nurse-demo-001",
        organizationId: "department-outpatient",
        active: true,
        code: {
          system: "http://terminology.hl7.org/CodeSystem/practitioner-role",
          code: "nurse",
          display: "Nurse"
        }
      }
    ]
  });
}

function cloneDirectory(directory: ProviderDirectory): ProviderDirectory {
  return ProviderDirectory.rehydrate(directory.toSnapshot());
}
