import { useState } from "react";
import type { AuditEvent, AuditIntegrityReport } from "../../types/audit.js";

export function useAuditState() {
  const [auditEvents, setAuditEvents] = useState<readonly AuditEvent[]>([]);
  const [globalAuditEvents, setGlobalAuditEvents] =
    useState<readonly AuditEvent[]>([]);
  const [auditIntegrityReport, setAuditIntegrityReport] =
    useState<AuditIntegrityReport>();
  const [auditFhirBundlePreview, setAuditFhirBundlePreview] =
    useState<unknown>();
  const [isLoadingAuditEvents, setIsLoadingAuditEvents] = useState(false);
  const [isLoadingGlobalAuditEvents, setIsLoadingGlobalAuditEvents] =
    useState(false);
  const [isVerifyingAuditIntegrity, setIsVerifyingAuditIntegrity] =
    useState(false);
  const [isExportingAuditFhir, setIsExportingAuditFhir] = useState(false);

  return {
    auditEvents,
    auditFhirBundlePreview,
    auditIntegrityReport,
    globalAuditEvents,
    isExportingAuditFhir,
    isLoadingAuditEvents,
    isLoadingGlobalAuditEvents,
    isVerifyingAuditIntegrity,
    setAuditEvents,
    setAuditFhirBundlePreview,
    setAuditIntegrityReport,
    setGlobalAuditEvents,
    setIsExportingAuditFhir,
    setIsLoadingAuditEvents,
    setIsLoadingGlobalAuditEvents,
    setIsVerifyingAuditIntegrity
  };
}
