export type FhirCapabilityStatement = {
  readonly resourceType: "CapabilityStatement";
  readonly id: string;
  readonly url?: string;
  readonly version?: string;
  readonly name: string;
  readonly title?: string;
  readonly status: "draft" | "active" | "retired" | "unknown";
  readonly experimental?: boolean;
  readonly date: string;
  readonly publisher?: string;
  readonly kind: "instance" | "capability" | "requirements";
  readonly software?: {
    readonly name: string;
    readonly version?: string;
  };
  readonly implementation?: {
    readonly description: string;
    readonly url?: string;
  };
  readonly fhirVersion: string;
  readonly format: readonly string[];
  readonly rest: readonly {
    readonly mode: "client" | "server";
    readonly documentation?: string;
    readonly security?: {
      readonly cors?: boolean;
      readonly description?: string;
    };
    readonly resource: readonly {
      readonly type: string;
      readonly profile?: string;
      readonly documentation?: string;
      readonly interaction: readonly {
        readonly code:
          | "read"
          | "vread"
          | "update"
          | "patch"
          | "delete"
          | "history-instance"
          | "history-type"
          | "create"
          | "search-type";
      }[];
    }[];
  }[];
};
