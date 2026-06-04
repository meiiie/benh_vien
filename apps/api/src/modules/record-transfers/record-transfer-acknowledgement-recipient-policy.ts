import type { ActorContext, ProviderDirectory } from "@benh-vien-so/domain";
import { organizationIsSameOrChild } from "./record-transfer-recipient-organization-scope.js";

export function canAcknowledgeForRecipient(
  actor: ActorContext,
  providerDirectory: ProviderDirectory,
  recipientOrganizationId: string
): boolean {
  if (actor.role === "admin") {
    return true;
  }

  if (actor.role !== "integration") {
    return false;
  }

  const snapshot = providerDirectory.toSnapshot();
  return snapshot.practitionerRoles.some(
    (role) =>
      role.active &&
      role.practitionerId === actor.actorId &&
      organizationIsSameOrChild(
        role.organizationId,
        recipientOrganizationId,
        snapshot.organizations
      )
  );
}
