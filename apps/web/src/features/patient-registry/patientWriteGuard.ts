import type { Patient } from "../../types/clinical.js";

type PatientWriteGuardConfig = {
  readonly selectedPatient: Patient | undefined;
  readonly selectedPatientMergeTarget: Patient | undefined;
  readonly selectedPatientWriteDisabled: boolean;
  readonly setStatusMessage: (message: string) => void;
};

export function buildPatientWriteGuard(config: PatientWriteGuardConfig) {
  const buildSelectedPatientMergedReadOnlyMessage = (): string => {
    if (!config.selectedPatient) {
      return "Chưa chọn hồ sơ bệnh nhân.";
    }

    const mergeTarget = config.selectedPatientMergeTarget
      ? `${config.selectedPatientMergeTarget.fullName} (${config.selectedPatientMergeTarget.id})`
      : (config.selectedPatient.mergedIntoPatientId ??
        "hồ sơ đích không còn trong danh sách tải về");

    return `Hồ sơ này đã được merge vào ${mergeTarget}. Các thao tác ghi mới bị khóa để bảo toàn lịch sử và tránh ghi nhầm vào hồ sơ nguồn.`;
  };

  return {
    buildSelectedPatientMergedReadOnlyMessage,
    ensureSelectedPatientWritable: (): boolean => {
      if (!config.selectedPatientWriteDisabled) {
        return true;
      }

      config.setStatusMessage(buildSelectedPatientMergedReadOnlyMessage());
      return false;
    }
  };
}
