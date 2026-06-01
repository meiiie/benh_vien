import { isLocalOnlyHostname } from "../network/local-only-hostname.js";

const defaultPublicApiBaseUrl = "http://localhost:7310/api/v1";

export function resolvePublicApiBaseUrl(): string {
  const rawValue = process.env.BVS_PUBLIC_API_BASE_URL?.trim();

  if (!rawValue) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("BVS_PUBLIC_API_BASE_URL must be set in production.");
    }

    return defaultPublicApiBaseUrl;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawValue);
  } catch {
    throw new Error("BVS_PUBLIC_API_BASE_URL must be a valid absolute URL.");
  }

  if (parsedUrl.search || parsedUrl.hash) {
    throw new Error("BVS_PUBLIC_API_BASE_URL must not include query or fragment.");
  }

  if (process.env.NODE_ENV === "production" && parsedUrl.protocol !== "https:") {
    throw new Error("BVS_PUBLIC_API_BASE_URL must use HTTPS in production.");
  }

  if (process.env.NODE_ENV === "production" && isLocalOnlyHostname(parsedUrl.hostname)) {
    throw new Error(
      "BVS_PUBLIC_API_BASE_URL must not use localhost, loopback, private or link-local hosts in production."
    );
  }

  return rawValue.replace(/\/+$/, "");
}
