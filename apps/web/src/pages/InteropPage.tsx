import type { ReactNode } from "react";
import { FhirPanel, PageBrief, PageHeader } from "../components/AppShell.js";
import {
  FhirDocumentBundleSummary
} from "../features/interoperability/FhirDocumentBundleSummary.js";
import {
  FhirTransferContextSummary,
  type FhirTransferContext
} from "../features/interoperability/FhirTransferContextSummary.js";
import type { Patient } from "../types/patientRegistry.js";
import type { ProviderDirectory } from "../types/providerDirectory.js";

type ReferenceSignal = {
  readonly name: string;
  readonly value: string;
};

type InteropPageProps = {
  readonly allergyIntoleranceFhirPreview: unknown;
  readonly capabilityStatementPreview: unknown;
  readonly conditionFhirPreview: unknown;
  readonly consentFhirPreview: unknown;
  readonly consentInteropPanel: ReactNode;
  readonly diagnosticReportFhirPreview: unknown;
  readonly documentFhirPreview: unknown;
  readonly documentProvenanceFhirPreview: unknown;
  readonly encounterFhirPreview: unknown;
  readonly imagingStudyFhirPreview: unknown;
  readonly medicationAdministrationFhirPreview: unknown;
  readonly medicationDispenseFhirPreview: unknown;
  readonly medicationRequestFhirPreview: unknown;
  readonly observationFhirPreview: unknown;
  readonly patientFhirBundlePreview: unknown;
  readonly patientFhirDocumentBundlePreview: unknown;
  readonly patientFhirPreview: unknown;
  readonly procedureFhirPreview: unknown;
  readonly providerDirectory?: ProviderDirectory;
  readonly providerDirectoryFhirPreview: unknown;
  readonly providerDirectoryPanel: ReactNode;
  readonly recordTransferFhirTaskPreview: unknown;
  readonly recordTransferInteropPanel: ReactNode;
  readonly referenceSignals: readonly ReferenceSignal[];
  readonly serviceRequestFhirPreview: unknown;
  readonly selectedPatient?: Patient;
  readonly transferContext: FhirTransferContext;
  readonly workflowSteps: readonly string[];
  readonly workflowTaskFhirPreview: unknown;
};

const interopBriefItems = [
  {
    label: "Định danh CCCD/VNeID",
    note: "Hồ sơ lâm sàng giữ CCCD/MRN ở Patient.identifier; VNeID thuộc lớp xác thực, tích hợp và cần được ghi audit riêng."
  },
  {
    label: "Consent, ký số và audit",
    note: "Mỗi lần xuất hồ sơ phải có căn cứ chia sẻ, dấu vết nguồn gốc, trạng thái ký/xác nhận và nhật ký truy cập."
  },
  {
    label: "Composition và Bundle",
    note: "Gói chuyển viện dùng Composition làm mục lục và Bundle type=document để bên nhận đọc được trọn bối cảnh."
  }
] as const;

export function InteropPage({
  allergyIntoleranceFhirPreview,
  capabilityStatementPreview,
  conditionFhirPreview,
  consentFhirPreview,
  consentInteropPanel,
  diagnosticReportFhirPreview,
  documentFhirPreview,
  documentProvenanceFhirPreview,
  encounterFhirPreview,
  imagingStudyFhirPreview,
  medicationAdministrationFhirPreview,
  medicationDispenseFhirPreview,
  medicationRequestFhirPreview,
  observationFhirPreview,
  patientFhirBundlePreview,
  patientFhirDocumentBundlePreview,
  patientFhirPreview,
  procedureFhirPreview,
  providerDirectory,
  providerDirectoryFhirPreview,
  providerDirectoryPanel,
  recordTransferFhirTaskPreview,
  recordTransferInteropPanel,
  referenceSignals,
  serviceRequestFhirPreview,
  selectedPatient,
  transferContext,
  workflowSteps,
  workflowTaskFhirPreview
}: InteropPageProps) {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Liên thông bệnh án điện tử"
        title="Chuẩn hóa gói FHIR để chuyển hồ sơ giữa bệnh viện"
        description="Màn này trình bày luồng chuyển bệnh án theo hướng EMR: xác định bệnh nhân, cơ sở gửi/nhận, quyền chia sẻ, gói tài liệu FHIR và dấu vết phục vụ kiểm toán."
      />

      <PageBrief
        ariaLabel="Trục chuẩn hóa liên thông bệnh án điện tử"
        className="interop-brief"
        items={interopBriefItems}
      />

      <section className="workflow-strip" aria-label="Các bước vận hành liên thông">
        {workflowSteps.map((item, index) => (
          <div className="workflow-step" key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item}</strong>
          </div>
        ))}
      </section>

      <section className="workspace">
        <FhirTransferContextSummary
          context={transferContext}
          patient={selectedPatient}
          providerDirectory={providerDirectory}
        />
        {providerDirectoryPanel}
        <FhirPanel title="Năng lực FHIR của cổng liên thông" badge="CapabilityStatement" value={capabilityStatementPreview} />
        <FhirPanel title="Danh bạ cơ sở y tế và endpoint FHIR" badge="Organization/Endpoint" value={providerDirectoryFhirPreview} />
        <FhirPanel title="Định danh bệnh nhân dưới dạng FHIR Patient" badge="Patient" value={patientFhirPreview} />
        <FhirPanel title="Gói dữ liệu hồ sơ bệnh nhân dạng collection Bundle" badge="Bundle" value={patientFhirBundlePreview} />
        <FhirDocumentBundleSummary value={patientFhirDocumentBundlePreview} />
        <FhirPanel title="Gói bệnh án điện tử dạng document Bundle" badge="Composition" value={patientFhirDocumentBundlePreview} />
        <FhirPanel title="Lượt khám dưới dạng FHIR Encounter" badge="Encounter" value={encounterFhirPreview} />
        <FhirPanel title="Dị ứng dưới dạng FHIR AllergyIntolerance" badge="AllergyIntolerance" value={allergyIntoleranceFhirPreview} />
        <FhirPanel title="Chẩn đoán dưới dạng FHIR Condition" badge="Condition" value={conditionFhirPreview} />
        <FhirPanel title="Chỉ định dịch vụ dưới dạng FHIR ServiceRequest" badge="ServiceRequest" value={serviceRequestFhirPreview} />
        <FhirPanel title="Công việc điều phối dưới dạng FHIR Task" badge="Task" value={workflowTaskFhirPreview} />
        <FhirPanel title="Thủ thuật dưới dạng FHIR Procedure" badge="Procedure" value={procedureFhirPreview} />
        <FhirPanel title="Dấu hiệu sinh tồn/kết quả rời rạc dưới dạng FHIR Observation" badge="Observation" value={observationFhirPreview} />
        <FhirPanel title="Báo cáo cận lâm sàng dưới dạng FHIR DiagnosticReport" badge="DiagnosticReport" value={diagnosticReportFhirPreview} />
        <FhirPanel title="Nghiên cứu hình ảnh dưới dạng FHIR ImagingStudy" badge="ImagingStudy" value={imagingStudyFhirPreview} />
        <FhirPanel title="Chỉ định thuốc dưới dạng FHIR MedicationRequest" badge="MedicationRequest" value={medicationRequestFhirPreview} />
        <FhirPanel title="Cấp phát thuốc dưới dạng FHIR MedicationDispense" badge="MedicationDispense" value={medicationDispenseFhirPreview} />
        <FhirPanel title="Ghi nhận dùng thuốc dưới dạng FHIR MedicationAdministration" badge="MedicationAdministration" value={medicationAdministrationFhirPreview} />
        <FhirPanel title="Tài liệu bệnh án dưới dạng FHIR DocumentReference" badge="DocumentReference" value={documentFhirPreview} />
        <FhirPanel title="Nguồn gốc tài liệu dưới dạng FHIR Provenance" badge="Provenance" value={documentProvenanceFhirPreview} />
        {consentInteropPanel}
        <FhirPanel title="Đồng ý chia sẻ dưới dạng FHIR Consent" badge="Consent" value={consentFhirPreview} />
        {recordTransferInteropPanel}
        <FhirPanel title="Lệnh chuyển hồ sơ dưới dạng FHIR Task" badge="Task" value={recordTransferFhirTaskPreview} />
        <article className="panel dark-panel">
          <p className="eyebrow">Bản đồ chuẩn tham chiếu</p>
          <h2>Các chuẩn đang bám theo</h2>
          <div className="reference-list">
            {referenceSignals.map((reference) => (
              <div key={reference.name}>
                <strong>{reference.name}</strong>
                <span>{reference.value}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
