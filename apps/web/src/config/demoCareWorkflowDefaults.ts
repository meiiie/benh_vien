import type {
  NewProcedureForm,
  NewServiceRequestForm
} from "../types/careWorkflow.js";
import type {
  NewDiagnosticReportForm,
  NewImagingStudyForm
} from "../types/diagnosticResults.js";

export const defaultServiceRequestForm: NewServiceRequestForm = {
  encounterId: "",
  reasonConditionId: "",
  category: "laboratory",
  priority: "urgent",
  codeSystem: "http://loinc.org",
  code: "58410-2",
  codeDisplay: "Complete blood count panel",
  occurrenceAt: "2026-05-27T11:00",
  authoredOn: "2026-05-27T10:40",
  requesterPractitionerId: "practitioner-demo-001",
  performerOrganizationId: "department-laboratory",
  patientInstruction: "Lấy mẫu theo hướng dẫn của khoa xét nghiệm.",
  note: "Chỉ định xét nghiệm/hình ảnh dùng để nối EMR với LIS/PACS."
};

export const defaultProcedureForm: NewProcedureForm = {
  encounterId: "",
  basedOnServiceRequestId: "",
  reasonConditionId: "",
  category: "diagnostic",
  status: "completed",
  codeSystem: "http://snomed.info/sct",
  code: "168537006",
  codeDisplay: "Chest X-ray",
  performedStart: "2026-05-27T12:15",
  performedEnd: "2026-05-27T12:30",
  performerActorType: "Practitioner",
  performerActorId: "practitioner-demo-001",
  performerFunctionSystem: "urn:wiiicare:nexus:procedure-performer-function",
  performerFunctionCode: "clinical-performer",
  performerFunctionDisplay: "Người thực hiện lâm sàng",
  onBehalfOfOrganizationId: "department-diagnostic-imaging",
  recorderPractitionerId: "practitioner-demo-001",
  asserterPractitionerId: "practitioner-demo-001",
  bodySiteSystem: "http://snomed.info/sct",
  bodySiteCode: "51185008",
  bodySiteDisplay: "Thoracic structure",
  outcomeSystem: "urn:wiiicare:nexus:procedure-outcome",
  outcomeCode: "completed",
  outcomeDisplay: "Hoàn tất thủ thuật",
  reportReferenceType: "DiagnosticReport",
  reportReferenceId: "",
  note:
    "Procedure ghi nhận hành động y tế đã thực hiện, khác với ServiceRequest là y lệnh và Task là hàng đợi thực thi."
};

export const defaultDiagnosticReportForm: NewDiagnosticReportForm = {
  encounterId: "",
  basedOnServiceRequestId: "",
  category: "laboratory",
  codeSystem: "http://loinc.org",
  code: "58410-2",
  codeDisplay: "Complete blood count panel",
  effectiveAt: "2026-05-27T11:30",
  issuedAt: "2026-05-27T12:00",
  performerOrganizationId: "department-laboratory",
  resultsInterpreterPractitionerId: "practitioner-demo-002",
  resultObservationIds: [],
  conclusion: "Kết quả phù hợp với bối cảnh lâm sàng hiện tại.",
  presentedFormUrl: "",
  presentedFormTitle: ""
};

export const defaultImagingStudyForm: NewImagingStudyForm = {
  encounterId: "",
  basedOnServiceRequestId: "",
  diagnosticReportId: "",
  studyInstanceUid: "1.2.826.0.1.3680043.10.543.202605270002",
  accessionNumber: "HP-CXR-20260527-0002",
  description: "Chest X-ray follow-up study",
  startedAt: "2026-05-27T12:10",
  referrerPractitionerId: "practitioner-demo-001",
  interpreterPractitionerId: "practitioner-demo-001",
  endpointId: "endpoint-pacs-hai-phong-demo",
  seriesUid: "1.2.826.0.1.3680043.10.543.202605270002.1",
  seriesNumber: "1",
  modalitySystem: "http://dicom.nema.org/resources/ontology/DCM",
  modalityCode: "DX",
  modalityDisplay: "Digital Radiography",
  seriesDescription: "PA and lateral chest radiographs",
  numberOfInstances: "2",
  bodySiteSystem: "http://snomed.info/sct",
  bodySiteCode: "51185008",
  bodySiteDisplay: "Thoracic structure"
};
