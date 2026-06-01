import { createDiagnosticReportRepository } from "../diagnostic-reports/create-diagnostic-report.repository.js";
import { createImagingStudyRepository } from "../imaging-studies/create-imaging-study.repository.js";
import type {
  ApiRepositories,
  ApiRepositoryOptions
} from "./api-repository.types.js";
import type { TrackRepository } from "./api-repository-lifecycle.js";

type DiagnosticRepositories = Pick<
  ApiRepositories,
  "diagnosticReportRepository" | "imagingStudyRepository"
>;

export async function createDiagnosticRepositories(
  options: ApiRepositoryOptions,
  trackRepository: TrackRepository
): Promise<DiagnosticRepositories> {
  return {
    diagnosticReportRepository:
      options.diagnosticReportRepository ??
      trackRepository(await createDiagnosticReportRepository()),
    imagingStudyRepository:
      options.imagingStudyRepository ?? trackRepository(await createImagingStudyRepository())
  };
}
