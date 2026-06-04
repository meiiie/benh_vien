import type { ProviderDirectory } from "@benh-vien-so/domain";

export function organizationIsSameOrChild(
  organizationId: string,
  expectedOrganizationId: string,
  organizations: ReturnType<ProviderDirectory["toSnapshot"]>["organizations"]
): boolean {
  let currentOrganizationId: string | undefined = organizationId;

  while (currentOrganizationId) {
    if (currentOrganizationId === expectedOrganizationId) {
      return true;
    }

    currentOrganizationId = organizations.find(
      (organization) => organization.id === currentOrganizationId
    )?.partOfOrganizationId;
  }

  return false;
}
