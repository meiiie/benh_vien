import {
  readBooleanEnv,
  readBoundedIntegerEnv
} from "./runtime-config-env.js";

const defaultHttpBodyLimitBytes = 1_048_576;
const minHttpBodyLimitBytes = 1_024;
const maxHttpBodyLimitBytes = 10 * 1_024 * 1_024;

export function resolveHttpBodyLimitBytes(): number {
  return readBoundedIntegerEnv(
    "BVS_HTTP_BODY_LIMIT_BYTES",
    defaultHttpBodyLimitBytes,
    minHttpBodyLimitBytes,
    maxHttpBodyLimitBytes
  );
}

export function resolveApiDocsEnabled(): boolean {
  return readBooleanEnv("BVS_API_DOCS_ENABLED", process.env.NODE_ENV !== "production");
}
