export type FhirIdentifier = {
  readonly system: string;
  readonly value: string;
  readonly type?: {
    readonly text: string;
  };
};

export type FhirContactPoint = {
  readonly system: "phone" | "email" | "url";
  readonly value: string;
  readonly use?: "work" | "mobile" | "home";
};
