import type { RevokeConsentCommand } from "./consentApi.js";

export function buildRevokeConsentCommand(): RevokeConsentCommand {
  return {
    reason: "Thu hồi theo yêu cầu người bệnh trong phiên demo."
  };
}
