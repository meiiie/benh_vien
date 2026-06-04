import type {
  ProviderEndpointSnapshot,
  ProviderOrganizationSnapshot,
  ProviderPractitionerRoleSnapshot,
  ProviderPractitionerSnapshot
} from "./provider-directory.types.js";

export function cloneOrganization(snapshot: ProviderOrganizationSnapshot): ProviderOrganizationSnapshot {
  return {
    ...snapshot,
    identifiers: snapshot.identifiers.map((identifier) => ({ ...identifier })),
    alias: snapshot.alias ? [...snapshot.alias] : undefined,
    telecom: snapshot.telecom?.map((telecom) => ({ ...telecom }))
  };
}

export function clonePractitioner(snapshot: ProviderPractitionerSnapshot): ProviderPractitionerSnapshot {
  return {
    ...snapshot,
    identifiers: snapshot.identifiers.map((identifier) => ({ ...identifier })),
    telecom: snapshot.telecom?.map((telecom) => ({ ...telecom }))
  };
}

export function cloneEndpoint(snapshot: ProviderEndpointSnapshot): ProviderEndpointSnapshot {
  return {
    ...snapshot,
    payloadTypes: snapshot.payloadTypes.map((payloadType) => ({ ...payloadType })),
    contact: snapshot.contact?.map((contact) => ({ ...contact }))
  };
}

export function clonePractitionerRole(
  snapshot: ProviderPractitionerRoleSnapshot
): ProviderPractitionerRoleSnapshot {
  return {
    ...snapshot,
    code: { ...snapshot.code },
    specialty: snapshot.specialty ? { ...snapshot.specialty } : undefined,
    endpointIds: snapshot.endpointIds ? [...snapshot.endpointIds] : undefined,
    telecom: snapshot.telecom?.map((telecom) => ({ ...telecom }))
  };
}
