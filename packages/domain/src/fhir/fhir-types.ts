import type { AdministrativeGender } from "../patient/patient.js";

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

export type FhirOrganization = {
  readonly resourceType: "Organization";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly active?: boolean;
  readonly type?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly name: string;
  readonly alias?: readonly string[];
  readonly telecom?: readonly FhirContactPoint[];
  readonly address?: readonly {
    readonly text: string;
  }[];
  readonly partOf?: {
    readonly reference: string;
  };
};

export type FhirPractitioner = {
  readonly resourceType: "Practitioner";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly active?: boolean;
  readonly name: readonly {
    readonly text: string;
  }[];
  readonly telecom?: readonly FhirContactPoint[];
  readonly qualification?: readonly {
    readonly code: {
      readonly text: string;
    };
  }[];
};

export type FhirEndpoint = {
  readonly resourceType: "Endpoint";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly status: "active" | "suspended" | "error" | "off" | "entered-in-error" | "test";
  readonly connectionType: {
    readonly system: string;
    readonly code: string;
    readonly display: string;
  };
  readonly name?: string;
  readonly managingOrganization?: {
    readonly reference: string;
  };
  readonly contact?: readonly FhirContactPoint[];
  readonly payloadType: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly address: string;
};

export type FhirPractitionerRole = {
  readonly resourceType: "PractitionerRole";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly active?: boolean;
  readonly period?: {
    readonly start?: string;
    readonly end?: string;
  };
  readonly practitioner?: {
    readonly reference: string;
  };
  readonly organization: {
    readonly reference: string;
  };
  readonly code?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly specialty?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly telecom?: readonly FhirContactPoint[];
  readonly endpoint?: readonly {
    readonly reference: string;
  }[];
};

export type FhirDocumentReference = {
  readonly resourceType: "DocumentReference";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly status: "current" | "superseded" | "entered-in-error";
  readonly docStatus?: "preliminary" | "final" | "entered-in-error";
  readonly type: {
    readonly text: string;
  };
  readonly subject: {
    readonly reference: string;
  };
  readonly context?: {
    readonly encounter?: readonly {
      readonly reference: string;
    }[];
  };
  readonly author?: readonly {
    readonly reference: string;
  }[];
  readonly date: string;
  readonly content: readonly {
    readonly attachment: {
      readonly url: string;
      readonly title: string;
    };
  }[];
};

export type FhirEncounter = {
  readonly resourceType: "Encounter";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly status:
    | "planned"
    | "in-progress"
    | "finished"
    | "cancelled"
    | "entered-in-error";
  readonly class: {
    readonly system: string;
    readonly code: string;
    readonly display?: string;
  };
  readonly type?: readonly {
    readonly text: string;
  }[];
  readonly subject: {
    readonly reference: string;
  };
  readonly participant?: readonly {
    readonly individual: {
      readonly reference: string;
    };
  }[];
  readonly period: {
    readonly start: string;
    readonly end?: string;
  };
  readonly reasonCode?: readonly {
    readonly text: string;
  }[];
  readonly serviceProvider?: {
    readonly reference: string;
  };
};

export type FhirCondition = {
  readonly resourceType: "Condition";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly clinicalStatus: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly verificationStatus: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly category: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly severity?: {
    readonly text: string;
  };
  readonly code: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly subject: {
    readonly reference: string;
  };
  readonly encounter?: {
    readonly reference: string;
  };
  readonly onsetDateTime?: string;
  readonly recordedDate: string;
  readonly recorder: {
    readonly reference: string;
  };
  readonly note?: readonly {
    readonly text: string;
  }[];
};

export type FhirObservation = {
  readonly resourceType: "Observation";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly status:
    | "registered"
    | "preliminary"
    | "final"
    | "amended"
    | "cancelled"
    | "entered-in-error";
  readonly category: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly code: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly subject: {
    readonly reference: string;
  };
  readonly encounter?: {
    readonly reference: string;
  };
  readonly effectiveDateTime: string;
  readonly valueQuantity?: {
    readonly value: number;
    readonly unit: string;
    readonly system?: string;
    readonly code?: string;
  };
  readonly valueString?: string;
  readonly performer?: readonly {
    readonly reference: string;
  }[];
};

export type FhirAllergyIntolerance = {
  readonly resourceType: "AllergyIntolerance";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly clinicalStatus?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly verificationStatus?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly type?: "allergy" | "intolerance";
  readonly category?: readonly ("food" | "medication" | "environment" | "biologic")[];
  readonly criticality?: "low" | "high" | "unable-to-assess";
  readonly code?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly patient: {
    readonly reference: string;
  };
  readonly encounter?: {
    readonly reference: string;
  };
  readonly recordedDate?: string;
  readonly recorder?: {
    readonly reference: string;
  };
  readonly reaction?: readonly {
    readonly manifestation: readonly {
      readonly coding: readonly {
        readonly system: string;
        readonly code: string;
        readonly display: string;
      }[];
      readonly text: string;
    }[];
    readonly severity?: "mild" | "moderate" | "severe";
    readonly description?: string;
  }[];
  readonly note?: readonly {
    readonly text: string;
  }[];
};

export type FhirMedicationRequest = {
  readonly resourceType: "MedicationRequest";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly status:
    | "active"
    | "on-hold"
    | "cancelled"
    | "completed"
    | "entered-in-error"
    | "stopped"
    | "draft"
    | "unknown";
  readonly intent:
    | "proposal"
    | "plan"
    | "order"
    | "original-order"
    | "reflex-order"
    | "filler-order"
    | "instance-order"
    | "option";
  readonly category?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly priority?: "routine" | "urgent" | "asap" | "stat";
  readonly medicationCodeableConcept: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly subject: {
    readonly reference: string;
  };
  readonly encounter?: {
    readonly reference: string;
  };
  readonly authoredOn?: string;
  readonly requester?: {
    readonly reference: string;
  };
  readonly reasonReference?: readonly {
    readonly reference: string;
  }[];
  readonly dosageInstruction?: readonly {
    readonly text: string;
    readonly route?: {
      readonly text: string;
    };
    readonly timing?: {
      readonly repeat: {
        readonly frequency: number;
        readonly period: number;
        readonly periodUnit: "h" | "d" | "wk";
      };
    };
    readonly doseAndRate?: readonly {
      readonly doseQuantity: {
        readonly value: number;
        readonly unit: string;
        readonly system?: string;
        readonly code?: string;
      };
    }[];
  }[];
  readonly dispenseRequest?: {
    readonly expectedSupplyDuration: {
      readonly value: number;
      readonly unit: string;
      readonly system: string;
      readonly code: string;
    };
  };
  readonly note?: readonly {
    readonly text: string;
  }[];
};

export type FhirServiceRequest = {
  readonly resourceType: "ServiceRequest";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly status:
    | "draft"
    | "active"
    | "on-hold"
    | "revoked"
    | "completed"
    | "entered-in-error"
    | "unknown";
  readonly intent:
    | "proposal"
    | "plan"
    | "directive"
    | "order"
    | "original-order"
    | "reflex-order"
    | "filler-order"
    | "instance-order"
    | "option";
  readonly category?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly priority?: "routine" | "urgent" | "asap" | "stat";
  readonly code?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly subject: {
    readonly reference: string;
  };
  readonly encounter?: {
    readonly reference: string;
  };
  readonly occurrenceDateTime?: string;
  readonly authoredOn?: string;
  readonly requester?: {
    readonly reference: string;
  };
  readonly performer?: readonly {
    readonly reference: string;
  }[];
  readonly reasonReference?: readonly {
    readonly reference: string;
  }[];
  readonly patientInstruction?: string;
  readonly note?: readonly {
    readonly text: string;
  }[];
};

export type FhirDiagnosticReport = {
  readonly resourceType: "DiagnosticReport";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly basedOn?: readonly {
    readonly reference: string;
  }[];
  readonly status:
    | "registered"
    | "partial"
    | "preliminary"
    | "final"
    | "amended"
    | "corrected"
    | "appended"
    | "cancelled"
    | "entered-in-error"
    | "unknown";
  readonly category?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly code: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly subject: {
    readonly reference: string;
  };
  readonly encounter?: {
    readonly reference: string;
  };
  readonly effectiveDateTime?: string;
  readonly issued?: string;
  readonly performer?: readonly {
    readonly reference: string;
  }[];
  readonly resultsInterpreter?: readonly {
    readonly reference: string;
  }[];
  readonly result?: readonly {
    readonly reference: string;
  }[];
  readonly conclusion?: string;
  readonly presentedForm?: readonly {
    readonly url: string;
    readonly title: string;
  }[];
};

export type FhirImagingStudy = {
  readonly resourceType: "ImagingStudy";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier: readonly FhirIdentifier[];
  readonly status:
    | "registered"
    | "available"
    | "cancelled"
    | "entered-in-error"
    | "unknown";
  readonly modality?: readonly {
    readonly system: string;
    readonly code: string;
    readonly display: string;
  }[];
  readonly subject: {
    readonly reference: string;
  };
  readonly encounter?: {
    readonly reference: string;
  };
  readonly started?: string;
  readonly basedOn?: readonly {
    readonly reference: string;
  }[];
  readonly referrer?: {
    readonly reference: string;
  };
  readonly interpreter?: readonly {
    readonly reference: string;
  }[];
  readonly endpoint?: readonly {
    readonly reference: string;
  }[];
  readonly numberOfSeries: number;
  readonly numberOfInstances: number;
  readonly description?: string;
  readonly series?: readonly {
    readonly uid: string;
    readonly number?: number;
    readonly modality: {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    };
    readonly description?: string;
    readonly numberOfInstances: number;
    readonly bodySite?: {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    };
    readonly started?: string;
  }[];
};

export type FhirComposition = {
  readonly resourceType: "Composition";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly status: "preliminary" | "final" | "amended" | "entered-in-error";
  readonly type: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly subject: {
    readonly reference: string;
  };
  readonly date: string;
  readonly author: readonly {
    readonly reference: string;
  }[];
  readonly title: string;
  readonly custodian?: {
    readonly reference: string;
  };
  readonly section?: readonly {
    readonly title: string;
    readonly text?: {
      readonly status: "generated";
      readonly div: string;
    };
    readonly entry?: readonly {
      readonly reference: string;
    }[];
  }[];
};

export type FhirPatient = {
  readonly resourceType: "Patient";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly active?: boolean;
  readonly name?: readonly {
    readonly text: string;
  }[];
  readonly gender?: AdministrativeGender;
  readonly birthDate?: string;
  readonly telecom?: readonly {
    readonly system: "phone";
    readonly value: string;
    readonly use: "mobile" | "home" | "work";
  }[];
  readonly address?: readonly {
    readonly text: string;
  }[];
  readonly managingOrganization?: {
    readonly reference: string;
  };
};

export type FhirBundleEntry = {
  readonly fullUrl: string;
  readonly resource:
    | FhirComposition
    | FhirOrganization
    | FhirPractitioner
    | FhirPractitionerRole
    | FhirEndpoint
    | FhirPatient
    | FhirEncounter
    | FhirCondition
    | FhirObservation
    | FhirAllergyIntolerance
    | FhirMedicationRequest
    | FhirServiceRequest
    | FhirDiagnosticReport
    | FhirImagingStudy
    | FhirDocumentReference;
};

export type FhirBundle = {
  readonly resourceType: "Bundle";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: {
    readonly system: string;
    readonly value: string;
  };
  readonly type: "collection" | "document";
  readonly timestamp: string;
  readonly entry: readonly FhirBundleEntry[];
};
