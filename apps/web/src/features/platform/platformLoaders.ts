import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import { isApiHttpError } from "../../api/clinicalApi.js";
import { getProviderDirectory } from "../provider-directory/providerDirectoryApi.js";
import { getApiRuntimeInfo, getFhirCapabilityStatement } from "./platformApi.js";
import type { ApiRuntimeInfo, AuthSession } from "../../types/appRuntime.js";
import type { ProviderDirectory } from "../../types/providerDirectory.js";

type SetPreview = (preview: unknown) => void;

type PlatformLoaderConfig = {
  readonly authSession: AuthSession | undefined;
  readonly clinicalApi: ClinicalApiClient;
  readonly isAuditOnlySession: boolean;
  readonly loadProviderDirectoryFhirPreview: () => Promise<void>;
  readonly setApiRuntimeInfo: (runtimeInfo: ApiRuntimeInfo | undefined) => void;
  readonly setApiRuntimeWarning: (warning: string | undefined) => void;
  readonly setCapabilityStatementPreview: SetPreview;
  readonly setIsLoadingProviderDirectory: (isLoading: boolean) => void;
  readonly setProviderDirectory: (providerDirectory: ProviderDirectory | undefined) => void;
  readonly setProviderDirectoryFhirPreview: SetPreview;
};

export function buildPlatformLoaders(config: PlatformLoaderConfig) {
  return {
    loadProviderDirectory: async () => {
      config.setIsLoadingProviderDirectory(true);

      try {
        if (config.isAuditOnlySession) {
          const directory = await getProviderDirectory(config.clinicalApi, "AUDIT");
          config.setProviderDirectory(directory);
          config.setProviderDirectoryFhirPreview({
            note: "Phiên kiểm toán chỉ tải danh bạ vận hành; không xuất FHIR Provider Directory."
          });
          return;
        }

        const directory = await getProviderDirectory(config.clinicalApi, "TREATMENT");
        config.setProviderDirectory(directory);
        await config.loadProviderDirectoryFhirPreview();
      } catch (error) {
        config.setProviderDirectory(undefined);
        config.setProviderDirectoryFhirPreview({
          error:
            error instanceof Error
              ? `Không thể tải Provider Directory: ${error.message}`
              : "Không thể tải Provider Directory."
        });
      } finally {
        config.setIsLoadingProviderDirectory(false);
      }
    },
    loadCapabilityStatement: async () => {
      try {
        config.setCapabilityStatementPreview(
          await getFhirCapabilityStatement(config.clinicalApi)
        );
      } catch (error) {
        config.setCapabilityStatementPreview({
          error:
            error instanceof Error
              ? `Không thể tải FHIR CapabilityStatement: ${error.message}`
              : "Không thể tải FHIR CapabilityStatement."
        });
      }
    },
    loadApiRuntimeInfo: async () => {
      try {
        const runtimeInfo = await getApiRuntimeInfo(
          config.clinicalApi,
          config.authSession
            ? config.authSession.actor.role === "auditor"
              ? "AUDIT"
              : "OPERATIONS"
            : undefined
        );
        config.setApiRuntimeInfo(runtimeInfo);
        config.setApiRuntimeWarning(undefined);
      } catch (error) {
        if (isApiHttpError(error) && error.status === 404) {
          config.setApiRuntimeInfo(undefined);
          config.setApiRuntimeWarning(
            "API runtime metadata chưa có trong backend đang chạy. Hãy khởi động lại backend mới nhất nếu cần kiểm tra phiên bản và trạng thái worker."
          );
          return;
        }

        config.setApiRuntimeInfo(undefined);
        config.setApiRuntimeWarning(
          error instanceof Error
            ? `Không thể đọc runtime metadata: ${error.message}`
            : "Không thể đọc runtime metadata."
        );
      }
    }
  };
}
