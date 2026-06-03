type FhirBundleLike = {
  readonly entry: readonly {
    readonly resource: {
      readonly resourceType: string;
    };
  }[];
};

type AuditEventWithRequestMetadata = {
  readonly metadata?: {
    readonly requestId?: string;
  };
};

export function bundleResourceTypes(body: FhirBundleLike): string[] {
  return body.entry.map((entry) => entry.resource.resourceType);
}

export function countBundleResource(
  body: FhirBundleLike,
  resourceType: string
): number {
  return bundleResourceTypes(body).filter((item) => item === resourceType).length;
}

export function findAuditEventByRequestId<T extends AuditEventWithRequestMetadata>(
  body: { readonly items: readonly T[] },
  requestId: string
): T | undefined {
  return body.items.find((event) => event.metadata?.requestId === requestId);
}
