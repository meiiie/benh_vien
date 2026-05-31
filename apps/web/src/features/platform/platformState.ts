import { useState } from "react";
import type { ApiRuntimeInfo, ProviderDirectory } from "../../types/clinical.js";

export function usePlatformState() {
  const [apiRuntimeInfo, setApiRuntimeInfo] = useState<ApiRuntimeInfo>();
  const [apiRuntimeWarning, setApiRuntimeWarning] = useState<string>();
  const [providerDirectory, setProviderDirectory] = useState<ProviderDirectory>();
  const [capabilityStatementPreview, setCapabilityStatementPreview] =
    useState<unknown>();
  const [providerDirectoryFhirPreview, setProviderDirectoryFhirPreview] =
    useState<unknown>();
  const [isLoadingProviderDirectory, setIsLoadingProviderDirectory] =
    useState(false);

  return {
    apiRuntimeInfo,
    apiRuntimeWarning,
    capabilityStatementPreview,
    isLoadingProviderDirectory,
    providerDirectory,
    providerDirectoryFhirPreview,
    setApiRuntimeInfo,
    setApiRuntimeWarning,
    setCapabilityStatementPreview,
    setIsLoadingProviderDirectory,
    setProviderDirectory,
    setProviderDirectoryFhirPreview
  };
}
