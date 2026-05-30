type LabeledValue = string;

type QuantityLike = {
  readonly value: number;
  readonly unit: string;
};

type DosageInstructionLike = {
  readonly text?: string;
  readonly doseQuantity?: QuantityLike;
  readonly frequency?: number;
  readonly period?: number;
  readonly periodUnit?: string;
};

type RecordTransferLike = {
  readonly id: string;
  readonly status: string;
  readonly receivedAt?: string;
  readonly failureReason?: string;
  readonly nextRetryAt?: string;
};

type RecordTransferDeliveryAttemptLike = {
  readonly status: string;
  readonly attemptNumber: number;
  readonly updatedAt: string;
  readonly httpStatus?: number;
  readonly errorMessage?: string;
};

type RecordTransferOperationalSummaryLike = {
  readonly severity: "info" | "success" | "warning" | "danger";
  readonly title: string;
  readonly description: string;
  readonly nextAction: string;
  readonly attemptCount: number;
  readonly failedAttemptCount: number;
  readonly lastHttpStatus: string;
  readonly nextRetry: string;
  readonly technicalSignal: string;
};

type MedicationDispenseLike = {
  readonly whenPrepared?: string;
  readonly whenHandedOver?: string;
};

type MedicationAdministrationPeriodLike = {
  readonly start?: string;
  readonly end?: string;
};

type MedicationAdministrationDosageLike = {
  readonly text?: string;
  readonly doseQuantity?: QuantityLike;
  readonly route?: {
    readonly display: string;
  };
};

type MedicationAdministrationPerformerLike = {
  readonly actorId: string;
  readonly function?: {
    readonly display: string;
  };
};

type WorkflowTaskReferenceLike = {
  readonly id: string;
  readonly resourceType: string;
  readonly label?: string;
};

type ProcedurePerformerLike = {
  readonly actorType: string;
  readonly actorId: string;
  readonly function?: {
    readonly display: string;
  };
  readonly onBehalfOfOrganizationId?: string;
};

type ProcedureReportReferenceLike = {
  readonly id: string;
  readonly resourceType: string;
};

type ObservationLike = {
  readonly valueQuantity?: QuantityLike;
  readonly valueText?: string;
};

function labelOf<T extends string>(
  labels: Readonly<Record<T, string>>,
  value: LabeledValue
): string {
  return labels[value as T] ?? value;
}

export function formatRuntimeFlag(
  value: boolean | null | undefined,
  trueLabel: string,
  falseLabel: string
): string {
  if (value === true) {
    return trueLabel;
  }

  if (value === false) {
    return falseLabel;
  }

  return "Chỉ dành cho vận hành";
}

export function formatGender(gender: string): string {
  return labelOf(
    {
      male: "Nam",
      female: "Nữ",
      other: "Khác",
      unknown: "Chưa rõ"
    },
    gender
  );
}

export function formatPatientRecordStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hoạt động",
      inactive: "Ngừng hoạt động",
      merged: "Đã merge"
    },
    status
  );
}

export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export function formatIdentifierType(type: string): string {
  return labelOf(
    {
      "national-id": "Định danh cá nhân",
      "insurance-id": "BHYT",
      "hospital-mrn": "MRN",
      "legacy-id": "Mã cũ"
    },
    type
  );
}

export function formatEncounterClass(value: string): string {
  return labelOf(
    {
      ambulatory: "Ngoại trú",
      inpatient: "Nội trú",
      emergency: "Cấp cứu",
      virtual: "Khám từ xa"
    },
    value
  );
}

export function formatEncounterStatus(status: string): string {
  return labelOf(
    {
      planned: "Đã hẹn",
      "in-progress": "Đang mở",
      finished: "Đã kết thúc",
      cancelled: "Đã hủy",
      "entered-in-error": "Nhập lỗi"
    },
    status
  );
}

export function formatDocumentType(type: string): string {
  return labelOf(
    {
      "admission-note": "Phiếu nhập viện",
      "discharge-summary": "Tóm tắt ra viện",
      "lab-report": "Kết quả xét nghiệm",
      "imaging-report": "Kết quả chẩn đoán hình ảnh",
      "referral-letter": "Giấy chuyển tuyến",
      "consent-form": "Phiếu đồng ý điều trị",
      "advance-directive": "Chỉ dẫn chăm sóc trước",
      ccda: "CCDA",
      ccr: "CCR",
      "medical-record": "Hồ sơ bệnh án",
      "patient-information": "Thông tin bệnh nhân"
    },
    type
  );
}

export function formatDocumentStatus(status: string): string {
  return labelOf(
    {
      draft: "Bản nháp",
      signed: "Đã ký",
      superseded: "Đã thay thế",
      "entered-in-error": "Nhập lỗi"
    },
    status
  );
}

export function formatProviderEndpointConnectionType(type: string): string {
  return labelOf(
    {
      "dicom-wado-rs": "DICOMweb/WADO-RS",
      "direct-project": "Direct Project",
      "hl7-fhir-rest": "HL7 FHIR REST",
      "hl7v2-mllp": "HL7 v2 MLLP",
      "ihe-xds": "IHE XDS",
      other: "Khác"
    },
    type
  );
}

export function formatConsentStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hiệu lực",
      revoked: "Đã thu hồi",
      expired: "Hết hiệu lực"
    },
    status
  );
}

export function formatRecordTransferStatus(status: string): string {
  return labelOf(
    {
      cancelled: "Đã hủy",
      completed: "Đã hoàn tất",
      "dead-lettered": "Hàng lỗi cuối",
      draft: "Bản nháp",
      failed: "Lỗi chuyển",
      "in-progress": "Đang xử lý",
      ready: "Sẵn sàng gửi",
      requested: "Đã yêu cầu"
    },
    status
  );
}

export function formatRecordTransferDeliveryAttemptStatus(status: string): string {
  return labelOf(
    {
      failed: "Gửi lỗi",
      queued: "Đang chờ gửi",
      succeeded: "Gửi thành công"
    },
    status
  );
}

export function formatRecordTransferPriority(priority: string): string {
  return labelOf(
    {
      asap: "Càng sớm càng tốt",
      routine: "Thường quy",
      stat: "Cấp cứu",
      urgent: "Khẩn"
    },
    priority
  );
}

export function formatRecordTransferRetryCount(retryCount: number | undefined): string {
  return `${retryCount ?? 0} lần`;
}

export function formatRecordTransferBundleType(bundleType: string): string {
  return labelOf(
    {
      collection: "FHIR collection Bundle",
      document: "FHIR document Bundle"
    },
    bundleType
  );
}

export function buildRecordTransferOperationalSummary(
  recordTransfer: RecordTransferLike,
  attempts: readonly RecordTransferDeliveryAttemptLike[]
): RecordTransferOperationalSummaryLike {
  const latestAttempt = getLatestRecordTransferAttempt(attempts);
  const failedAttemptCount = attempts.filter((attempt) => attempt.status === "failed").length;
  const lastHttpStatus = latestAttempt?.httpStatus
    ? `HTTP ${latestAttempt.httpStatus}`
    : "Chưa có";
  const nextRetry = recordTransfer.nextRetryAt
    ? formatDateTime(recordTransfer.nextRetryAt)
    : "Chưa hẹn";
  const technicalSignal = latestAttempt
    ? `Lần #${latestAttempt.attemptNumber}: ${formatRecordTransferDeliveryAttemptStatus(latestAttempt.status)}`
    : "Chưa có delivery attempt";
  const baseMetrics = {
    attemptCount: attempts.length,
    failedAttemptCount,
    lastHttpStatus,
    nextRetry,
    technicalSignal
  };

  if (recordTransfer.status === "completed") {
    return {
      ...baseMetrics,
      severity: "success",
      title: "Đã hoàn tất tiếp nhận",
      description: recordTransfer.receivedAt
        ? `Bên nhận đã xác nhận lúc ${formatDateTime(recordTransfer.receivedAt)}.`
        : "Bên nhận đã xác nhận gói chuyển hồ sơ.",
      nextAction:
        "Đối chiếu biên nhận tiếp nhận, audit trail và FHIR Task để đóng hồ sơ vận hành."
    };
  }

  if (recordTransfer.status === "dead-lettered") {
    return {
      ...baseMetrics,
      severity: "danger",
      title: "Cần can thiệp thủ công",
      description:
        "Gói chuyển đã vượt quá số lần thử tự động hoặc được đưa vào hàng lỗi cuối.",
      nextAction:
        "Kiểm tra endpoint FHIR, consent, mạng, chứng thư/gateway bên nhận rồi tạo quy trình xử lý lại có kiểm soát."
    };
  }

  if (recordTransfer.status === "failed") {
    const retryDue = recordTransfer.nextRetryAt
      ? Date.parse(recordTransfer.nextRetryAt) <= Date.now()
      : false;

    return {
      ...baseMetrics,
      severity: retryDue ? "warning" : "info",
      title: retryDue ? "Đã đến hạn gửi lại" : "Đang chờ lịch gửi lại",
      description:
        recordTransfer.failureReason ??
        "Worker hoặc người vận hành đã ghi nhận lỗi chuyển hồ sơ.",
      nextAction: retryDue
        ? "Đưa gói về hàng đợi gửi lại hoặc kiểm tra nguyên nhân trước khi retry."
        : "Theo dõi mốc retry; nếu lỗi do cấu hình endpoint thì sửa trước khi gửi lại."
    };
  }

  if (recordTransfer.status === "in-progress") {
    if (latestAttempt?.status === "queued") {
      return {
        ...baseMetrics,
        severity: "info",
        title: "Đang chờ delivery worker",
        description:
          "Gói đã được đánh dấu gửi và có delivery attempt trong outbox, nhưng chưa có kết quả POST Bundle.",
        nextAction:
          "Kiểm tra delivery worker có đang bật, hàng đợi có được xử lý và endpoint đích có sẵn sàng."
      };
    }

    if (latestAttempt?.status === "succeeded") {
      return {
        ...baseMetrics,
        severity: "success",
        title: "Đã gửi Bundle, chờ xác nhận nhận",
        description:
          "FHIR Bundle đã được endpoint đích phản hồi thành công; gói vẫn cần biên nhận hoặc mốc received để hoàn tất.",
        nextAction:
          "Chờ acknowledgement callback hoặc xác nhận tiếp nhận từ bệnh viện nhận."
      };
    }

    if (latestAttempt?.status === "failed") {
      return {
        ...baseMetrics,
        severity: "warning",
        title: "Lần gửi gần nhất bị lỗi",
        description: latestAttempt.errorMessage ?? "Endpoint đích chưa nhận thành công FHIR Bundle.",
        nextAction:
          "Xem lỗi của delivery attempt, sửa nguyên nhân và đưa gói vào lịch retry."
      };
    }

    return {
      ...baseMetrics,
      severity: "info",
      title: "Đã đánh dấu gửi",
      description:
        "Gói ở trạng thái đang xử lý nhưng chưa thấy delivery attempt tương ứng trên giao diện.",
      nextAction:
        "Tải lại lịch sử gửi; nếu vẫn trống, kiểm tra bước tạo outbox/delivery attempt."
    };
  }

  if (recordTransfer.status === "cancelled") {
    return {
      ...baseMetrics,
      severity: "warning",
      title: "Gói đã hủy",
      description: "Luồng chuyển hồ sơ này không còn được tiếp tục.",
      nextAction:
        "Nếu vẫn cần liên thông, tạo gói chuyển mới với consent và endpoint hợp lệ."
    };
  }

  return {
    ...baseMetrics,
    severity: "info",
    title:
      recordTransfer.status === "ready"
        ? "Sẵn sàng gửi"
        : "Chưa gửi sang hệ thống nhận",
    description:
      "Gói đã có consent và thông tin đơn vị nhận; chưa phát sinh POST Bundle ra endpoint FHIR.",
    nextAction:
      "Kiểm tra consent, endpoint FHIR của đơn vị nhận và bấm gửi khi đủ điều kiện vận hành."
  };
}

function getLatestRecordTransferAttempt(
  attempts: readonly RecordTransferDeliveryAttemptLike[]
): RecordTransferDeliveryAttemptLike | undefined {
  return attempts.reduce<RecordTransferDeliveryAttemptLike | undefined>((latest, attempt) => {
    if (!latest) {
      return attempt;
    }

    if (attempt.attemptNumber !== latest.attemptNumber) {
      return attempt.attemptNumber > latest.attemptNumber ? attempt : latest;
    }

    return Date.parse(attempt.updatedAt) > Date.parse(latest.updatedAt) ? attempt : latest;
  }, undefined);
}

export function resolveSelectedRecordTransferId(input: {
  readonly items: readonly RecordTransferLike[];
  readonly preferredId?: string;
  readonly currentId?: string;
}): string | undefined {
  const preferredId = input.preferredId?.trim();
  const currentId = input.currentId?.trim();

  if (preferredId && input.items.some((item) => item.id === preferredId)) {
    return preferredId;
  }

  if (currentId && input.items.some((item) => item.id === currentId)) {
    return currentId;
  }

  return input.items[0]?.id;
}

export function isMissingRecordTransferDeliveryAttemptsRoute(payload: unknown): boolean {
  const message = (payload as { readonly message?: unknown } | undefined)?.message;

  return (
    typeof message === "string" &&
    message.includes("Route GET:") &&
    message.includes("/record-transfers/") &&
    message.includes("/delivery-attempts")
  );
}

export function formatConsentCategory(category: string): string {
  return labelOf(
    {
      "record-sharing": "Chia sẻ hồ sơ"
    },
    category
  );
}

export function formatAllergyType(type: string): string {
  return labelOf(
    {
      allergy: "Dị ứng",
      intolerance: "Không dung nạp"
    },
    type
  );
}

export function formatAllergyCategory(category: string): string {
  return labelOf(
    {
      biologic: "Sinh phẩm",
      environment: "Môi trường",
      food: "Thực phẩm",
      medication: "Thuốc"
    },
    category
  );
}

export function formatAllergyCriticality(criticality: string | undefined): string {
  if (!criticality) {
    return "Chưa đánh giá";
  }

  return labelOf(
    {
      high: "Nguy cơ cao",
      low: "Nguy cơ thấp",
      "unable-to-assess": "Chưa thể đánh giá"
    },
    criticality
  );
}

export function formatAllergyClinicalStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hoạt động",
      inactive: "Không hoạt động",
      resolved: "Đã giải quyết"
    },
    status
  );
}

export function formatAllergyVerificationStatus(status: string): string {
  return labelOf(
    {
      confirmed: "Đã xác nhận",
      "entered-in-error": "Nhập lỗi",
      refuted: "Đã loại trừ",
      unconfirmed: "Chưa xác nhận"
    },
    status
  );
}

export function formatConditionCategory(category: string): string {
  return labelOf(
    {
      "encounter-diagnosis": "Chẩn đoán theo lượt khám",
      "problem-list-item": "Vấn đề sức khỏe dài hạn"
    },
    category
  );
}

export function formatConditionClinicalStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hoạt động",
      inactive: "Không hoạt động",
      recurrence: "Tái phát",
      relapse: "Diễn tiến lại",
      remission: "Thuyên giảm",
      resolved: "Đã giải quyết"
    },
    status
  );
}

export function formatConditionVerificationStatus(status: string): string {
  return labelOf(
    {
      confirmed: "Đã xác nhận",
      differential: "Chẩn đoán phân biệt",
      "entered-in-error": "Nhập lỗi",
      provisional: "Tạm thời",
      refuted: "Đã loại trừ",
      unconfirmed: "Chưa xác nhận"
    },
    status
  );
}

export function formatConditionSeverity(severity: string): string {
  return labelOf(
    {
      mild: "Nhẹ",
      moderate: "Trung bình",
      severe: "Nặng"
    },
    severity
  );
}

export function formatMedicationRequestCategory(category: string): string {
  return labelOf(
    {
      community: "Cộng đồng",
      discharge: "Ra viện",
      inpatient: "Nội trú",
      outpatient: "Ngoại trú"
    },
    category
  );
}

export function formatMedicationRequestStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hiệu lực",
      cancelled: "Đã hủy",
      completed: "Đã hoàn tất",
      draft: "Bản nháp",
      "entered-in-error": "Nhập lỗi",
      "on-hold": "Tạm giữ",
      stopped: "Đã dừng",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatMedicationRequestIntent(intent: string): string {
  return labelOf(
    {
      "filler-order": "Lệnh thực hiện",
      "instance-order": "Lệnh dùng cụ thể",
      option: "Tùy chọn",
      order: "Chỉ định",
      "original-order": "Chỉ định gốc",
      plan: "Kế hoạch",
      proposal: "Đề xuất",
      "reflex-order": "Chỉ định phản xạ"
    },
    intent
  );
}

export function formatMedicationRequestPriority(priority: string): string {
  return labelOf(
    {
      asap: "Càng sớm càng tốt",
      routine: "Thường quy",
      stat: "Ngay lập tức",
      urgent: "Khẩn"
    },
    priority
  );
}

export function formatDosageInstruction(dosageInstruction: DosageInstructionLike): string {
  const dose = dosageInstruction.doseQuantity
    ? `${dosageInstruction.doseQuantity.value} ${dosageInstruction.doseQuantity.unit}`
    : undefined;
  const timing =
    dosageInstruction.frequency && dosageInstruction.period && dosageInstruction.periodUnit
      ? `${dosageInstruction.frequency} lần/${dosageInstruction.period}${dosageInstruction.periodUnit}`
      : undefined;

  return [dosageInstruction.text, dose, timing].filter(Boolean).join(" · ");
}

export function formatMedicationDispenseCategory(category: string): string {
  return labelOf(
    {
      community: "Cộng đồng",
      discharge: "Ra viện",
      inpatient: "Nội trú",
      outpatient: "Ngoại trú"
    },
    category
  );
}

export function formatMedicationDispenseStatus(status: string): string {
  return labelOf(
    {
      cancelled: "Đã hủy",
      completed: "Đã cấp phát",
      declined: "Từ chối cấp phát",
      "entered-in-error": "Nhập lỗi",
      "in-progress": "Đang cấp phát",
      "on-hold": "Tạm giữ",
      preparation: "Đang chuẩn bị",
      stopped: "Đã dừng",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatMedicationDispenseQuantity(quantity: QuantityLike | undefined): string {
  if (!quantity) {
    return "Chưa có";
  }

  return `${quantity.value} ${quantity.unit}`;
}

export function formatMedicationDispenseTime(dispense: MedicationDispenseLike): string {
  if (dispense.whenPrepared && dispense.whenHandedOver) {
    return `${formatDateTime(dispense.whenPrepared)} → ${formatDateTime(dispense.whenHandedOver)}`;
  }

  if (dispense.whenHandedOver) {
    return formatDateTime(dispense.whenHandedOver);
  }

  if (dispense.whenPrepared) {
    return `Chuẩn bị ${formatDateTime(dispense.whenPrepared)}`;
  }

  return "Chưa có";
}

export function formatMedicationAdministrationCategory(category: string): string {
  return labelOf(
    {
      community: "Cộng đồng",
      inpatient: "Nội trú",
      outpatient: "Ngoại trú",
      "patient-specified": "Bệnh nhân tự khai"
    },
    category
  );
}

export function formatMedicationAdministrationStatus(status: string): string {
  return labelOf(
    {
      completed: "Đã dùng",
      "entered-in-error": "Nhập lỗi",
      "in-progress": "Đang dùng",
      "not-done": "Không dùng",
      "on-hold": "Tạm giữ",
      stopped: "Đã dừng",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatMedicationAdministrationPeriod(
  period: MedicationAdministrationPeriodLike
): string {
  if (period.start && period.end) {
    return `${formatDateTime(period.start)} - ${formatDateTime(period.end)}`;
  }

  if (period.start) {
    return formatDateTime(period.start);
  }

  if (period.end) {
    return formatDateTime(period.end);
  }

  return "Chưa có";
}

export function formatMedicationAdministrationDose(
  dosage: MedicationAdministrationDosageLike | undefined
): string {
  if (!dosage) {
    return "Chưa có";
  }

  const dose = dosage.doseQuantity
    ? `${dosage.doseQuantity.value} ${dosage.doseQuantity.unit}`
    : undefined;
  const route = dosage.route?.display;

  return [dosage.text, dose, route].filter(Boolean).join(" · ") || "Chưa có";
}

export function formatMedicationAdministrationPerformers(
  performers: readonly MedicationAdministrationPerformerLike[]
): string {
  if (performers.length === 0) {
    return "Chưa có";
  }

  return performers
    .map((performer) =>
      performer.function?.display
        ? `${performer.actorId} (${performer.function.display})`
        : performer.actorId
    )
    .join(", ");
}

export function formatServiceRequestCategory(category: string): string {
  return labelOf(
    {
      consultation: "Hội chẩn/tư vấn",
      imaging: "Chẩn đoán hình ảnh",
      laboratory: "Xét nghiệm",
      procedure: "Thủ thuật",
      therapy: "Điều trị/phục hồi"
    },
    category
  );
}

export function formatServiceRequestStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hiệu lực",
      completed: "Đã hoàn tất",
      draft: "Bản nháp",
      "entered-in-error": "Nhập lỗi",
      "on-hold": "Tạm giữ",
      revoked: "Đã hủy",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatServiceRequestIntent(intent: string): string {
  return labelOf(
    {
      directive: "Chỉ thị",
      "filler-order": "Lệnh thực hiện",
      "instance-order": "Lệnh dùng cụ thể",
      option: "Tùy chọn",
      order: "Chỉ định",
      "original-order": "Chỉ định gốc",
      plan: "Kế hoạch",
      proposal: "Đề xuất",
      "reflex-order": "Chỉ định phản xạ"
    },
    intent
  );
}

export function formatServiceRequestPriority(priority: string): string {
  return labelOf(
    {
      asap: "Càng sớm càng tốt",
      routine: "Thường quy",
      stat: "Ngay lập tức",
      urgent: "Khẩn"
    },
    priority
  );
}

export function formatWorkflowTaskStatus(status: string): string {
  return labelOf(
    {
      accepted: "Đã nhận",
      cancelled: "Đã hủy",
      completed: "Hoàn tất",
      draft: "Bản nháp",
      "entered-in-error": "Nhập lỗi",
      failed: "Thất bại",
      "in-progress": "Đang thực hiện",
      "on-hold": "Tạm giữ",
      ready: "Sẵn sàng",
      received: "Đã tiếp nhận",
      rejected: "Từ chối",
      requested: "Đã yêu cầu"
    },
    status
  );
}

export function formatWorkflowTaskReferences(
  references: readonly WorkflowTaskReferenceLike[]
): string {
  if (references.length === 0) {
    return "Chưa gắn";
  }

  return references
    .map((reference) => `${reference.label ?? reference.resourceType}: ${reference.resourceType}/${reference.id}`)
    .join(" · ");
}

export function formatProcedureStatus(status: string): string {
  return labelOf(
    {
      preparation: "Chuẩn bị",
      "in-progress": "Đang thực hiện",
      "not-done": "Không thực hiện",
      "on-hold": "Tạm giữ",
      stopped: "Đã dừng",
      completed: "Hoàn tất",
      "entered-in-error": "Nhập lỗi",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatProcedureCategory(category: string): string {
  return labelOf(
    {
      surgical: "Phẫu thuật",
      diagnostic: "Chẩn đoán",
      therapeutic: "Điều trị",
      counseling: "Tư vấn",
      rehabilitation: "Phục hồi chức năng",
      other: "Khác"
    },
    category
  );
}

export function formatProcedurePerformers(performers: readonly ProcedurePerformerLike[]): string {
  if (performers.length === 0) {
    return "Chưa có";
  }

  return performers
    .map((performer) =>
      [
        `${performer.actorType}/${performer.actorId}`,
        performer.function?.display,
        performer.onBehalfOfOrganizationId ? `thay mặt ${performer.onBehalfOfOrganizationId}` : undefined
      ]
        .filter(Boolean)
        .join(" · ")
    )
    .join(", ");
}

export function formatProcedureReferences(
  references: readonly ProcedureReportReferenceLike[]
): string {
  if (references.length === 0) {
    return "Chưa có";
  }

  return references.map((reference) => `${reference.resourceType}/${reference.id}`).join(", ");
}

export function formatObservationCategory(category: string): string {
  return labelOf(
    {
      laboratory: "Xét nghiệm",
      "vital-signs": "Sinh hiệu"
    },
    category
  );
}

export function formatObservationStatus(status: string): string {
  return labelOf(
    {
      registered: "Đã đăng ký",
      preliminary: "Sơ bộ",
      final: "Chính thức",
      amended: "Đã hiệu chỉnh",
      cancelled: "Đã hủy",
      "entered-in-error": "Nhập lỗi"
    },
    status
  );
}

export function formatObservationValue(observation: ObservationLike): string {
  if (observation.valueQuantity) {
    return `${observation.valueQuantity.value} ${observation.valueQuantity.unit}`;
  }

  return observation.valueText ?? "Chưa có giá trị";
}

export function formatDiagnosticReportCategory(category: string): string {
  return labelOf(
    {
      imaging: "Chẩn đoán hình ảnh",
      laboratory: "Xét nghiệm",
      other: "Khác",
      pathology: "Giải phẫu bệnh"
    },
    category
  );
}

export function formatDiagnosticReportStatus(status: string): string {
  return labelOf(
    {
      amended: "Đã hiệu chỉnh",
      appended: "Đã bổ sung",
      cancelled: "Đã hủy",
      corrected: "Đã sửa",
      "entered-in-error": "Nhập lỗi",
      final: "Chính thức",
      partial: "Một phần",
      preliminary: "Sơ bộ",
      registered: "Đã đăng ký",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatImagingStudyStatus(status: string): string {
  return labelOf(
    {
      available: "Sẵn sàng",
      cancelled: "Đã hủy",
      "entered-in-error": "Nhập lỗi",
      registered: "Đã đăng ký",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function toApiDateTime(value: string): string {
  return new Date(value).toISOString();
}
