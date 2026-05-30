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
      readonly contentType?: string;
      readonly url: string;
      readonly size?: number;
      readonly hash?: string;
      readonly title: string;
      readonly creation?: string;
    };
  }[];
};

export type FhirProvenance = {
  readonly resourceType: "Provenance";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly target: readonly {
    readonly reference: string;
    readonly display?: string;
  }[];
  readonly occurredDateTime?: string;
  readonly recorded: string;
  readonly policy?: readonly string[];
  readonly activity?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly agent: readonly {
    readonly type?: {
      readonly coding: readonly {
        readonly system: string;
        readonly code: string;
        readonly display: string;
      }[];
      readonly text: string;
    };
    readonly role?: readonly {
      readonly text: string;
    }[];
    readonly who: {
      readonly reference: string;
      readonly display?: string;
    };
    readonly onBehalfOf?: {
      readonly reference: string;
    };
  }[];
  readonly entity?: readonly {
    readonly role: "derivation" | "revision" | "quotation" | "source" | "removal";
    readonly what: {
      readonly reference?: string;
      readonly display?: string;
    };
  }[];
};

export type FhirConsent = {
  readonly resourceType: "Consent";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly extension?: readonly {
    readonly url: string;
    readonly extension: readonly (
      | {
          readonly url: string;
          readonly valueReference: {
            readonly reference: string;
          };
        }
      | {
          readonly url: string;
          readonly valueDateTime: string;
        }
      | {
          readonly url: string;
          readonly valueString: string;
        }
    )[];
  }[];
  readonly identifier?: readonly FhirIdentifier[];
  readonly status: "draft" | "proposed" | "active" | "rejected" | "inactive" | "entered-in-error";
  readonly scope: {
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
  readonly patient: {
    readonly reference: string;
  };
  readonly dateTime: string;
  readonly performer?: readonly {
    readonly reference: string;
  }[];
  readonly sourceReference?: {
    readonly reference: string;
  };
  readonly provision?: {
    readonly type: "deny" | "permit";
    readonly period?: {
      readonly start?: string;
      readonly end?: string;
    };
    readonly actor?: readonly {
      readonly role: {
        readonly text: string;
      };
      readonly reference: {
        readonly reference: string;
      };
    }[];
    readonly action?: readonly {
      readonly coding: readonly {
        readonly system: string;
        readonly code: string;
        readonly display: string;
      }[];
      readonly text: string;
    }[];
    readonly purpose?: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly class?: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
  };
};

export type FhirAuditEvent = {
  readonly resourceType: "AuditEvent";
  readonly id?: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly type: {
    readonly system: string;
    readonly code: string;
    readonly display: string;
  };
  readonly subtype?: readonly {
    readonly system: string;
    readonly code: string;
    readonly display: string;
  }[];
  readonly action?: "C" | "R" | "U" | "D" | "E";
  readonly recorded: string;
  readonly outcome?: "0" | "4" | "8" | "12";
  readonly outcomeDesc?: string;
  readonly agent: readonly {
    readonly who?: {
      readonly reference?: string;
      readonly display?: string;
    };
    readonly requestor: boolean;
    readonly purposeOfUse?: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly network?: {
      readonly address: string;
      readonly type: "1" | "2" | "3" | "4" | "5";
    };
  }[];
  readonly source: {
    readonly site?: string;
    readonly observer: {
      readonly display: string;
    };
    readonly type?: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
  };
  readonly entity?: readonly {
    readonly what?: {
      readonly reference?: string;
      readonly display?: string;
    };
    readonly name?: string;
    readonly description?: string;
    readonly detail?: readonly {
      readonly type: string;
      readonly valueString: string;
    }[];
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

export type FhirMedicationDispense = {
  readonly resourceType: "MedicationDispense";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly status:
    | "preparation"
    | "in-progress"
    | "cancelled"
    | "on-hold"
    | "completed"
    | "entered-in-error"
    | "stopped"
    | "declined"
    | "unknown";
  readonly statusReasonCodeableConcept?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly category?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
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
  readonly context?: {
    readonly reference: string;
  };
  readonly authorizingPrescription?: readonly {
    readonly reference: string;
  }[];
  readonly performer?: readonly {
    readonly function?: {
      readonly coding: readonly {
        readonly system: string;
        readonly code: string;
        readonly display: string;
      }[];
      readonly text: string;
    };
    readonly actor: {
      readonly reference: string;
    };
  }[];
  readonly quantity?: {
    readonly value: number;
    readonly unit: string;
    readonly system?: string;
    readonly code?: string;
  };
  readonly daysSupply?: {
    readonly value: number;
    readonly unit: string;
    readonly system?: string;
    readonly code?: string;
  };
  readonly whenPrepared?: string;
  readonly whenHandedOver?: string;
  readonly destination?: {
    readonly reference: string;
  };
  readonly receiver?: readonly {
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
  readonly note?: readonly {
    readonly text: string;
  }[];
};

export type FhirMedicationAdministration = {
  readonly resourceType: "MedicationAdministration";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly status:
    | "in-progress"
    | "not-done"
    | "on-hold"
    | "completed"
    | "entered-in-error"
    | "stopped"
    | "unknown";
  readonly statusReason?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly category?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
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
  readonly context?: {
    readonly reference: string;
  };
  readonly effectivePeriod: {
    readonly start?: string;
    readonly end?: string;
  };
  readonly performer?: readonly {
    readonly function?: {
      readonly coding: readonly {
        readonly system: string;
        readonly code: string;
        readonly display: string;
      }[];
      readonly text: string;
    };
    readonly actor: {
      readonly reference: string;
    };
  }[];
  readonly reasonReference?: readonly {
    readonly reference: string;
  }[];
  readonly request?: {
    readonly reference: string;
  };
  readonly dosage?: {
    readonly text?: string;
    readonly route?: {
      readonly coding: readonly {
        readonly system: string;
        readonly code: string;
        readonly display: string;
      }[];
      readonly text: string;
    };
    readonly dose?: {
      readonly value: number;
      readonly unit: string;
      readonly system?: string;
      readonly code?: string;
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

export type FhirTask = {
  readonly resourceType: "Task";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly basedOn?: readonly {
    readonly reference: string;
  }[];
  readonly status:
    | "draft"
    | "requested"
    | "received"
    | "accepted"
    | "rejected"
    | "ready"
    | "cancelled"
    | "in-progress"
    | "on-hold"
    | "failed"
    | "completed"
    | "entered-in-error";
  readonly businessStatus?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly intent:
    | "unknown"
    | "proposal"
    | "plan"
    | "order"
    | "original-order"
    | "reflex-order"
    | "filler-order"
    | "instance-order"
    | "option";
  readonly priority?: "routine" | "urgent" | "asap" | "stat";
  readonly code?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly description?: string;
  readonly focus?: {
    readonly reference: string;
  };
  readonly for: {
    readonly reference: string;
  };
  readonly encounter?: {
    readonly reference: string;
  };
  readonly executionPeriod?: {
    readonly start?: string;
    readonly end?: string;
  };
  readonly authoredOn?: string;
  readonly lastModified?: string;
  readonly requester?: {
    readonly reference: string;
  };
  readonly owner?: {
    readonly reference: string;
  };
  readonly input?: readonly {
    readonly type: {
      readonly text: string;
    };
    readonly valueReference: {
      readonly reference: string;
      readonly display?: string;
    };
  }[];
  readonly output?: readonly {
    readonly type: {
      readonly text: string;
    };
    readonly valueReference: {
      readonly reference: string;
      readonly display?: string;
    };
  }[];
  readonly note?: readonly {
    readonly text: string;
  }[];
};

export type FhirProcedure = {
  readonly resourceType: "Procedure";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly basedOn?: readonly {
    readonly reference: string;
  }[];
  readonly partOf?: readonly {
    readonly reference: string;
  }[];
  readonly status:
    | "preparation"
    | "in-progress"
    | "not-done"
    | "on-hold"
    | "stopped"
    | "completed"
    | "entered-in-error"
    | "unknown";
  readonly statusReason?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly category?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
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
  readonly performedPeriod?: {
    readonly start?: string;
    readonly end?: string;
  };
  readonly recorder?: {
    readonly reference: string;
  };
  readonly asserter?: {
    readonly reference: string;
  };
  readonly performer?: readonly {
    readonly function?: {
      readonly coding: readonly {
        readonly system: string;
        readonly code: string;
        readonly display: string;
      }[];
      readonly text: string;
    };
    readonly actor: {
      readonly reference: string;
    };
    readonly onBehalfOf?: {
      readonly reference: string;
    };
  }[];
  readonly reasonReference?: readonly {
    readonly reference: string;
  }[];
  readonly bodySite?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly outcome?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly report?: readonly {
    readonly reference: string;
  }[];
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
  readonly link?: readonly {
    readonly other: {
      readonly reference: string;
    };
    readonly type: "replaced-by" | "replaces" | "refer" | "seealso";
  }[];
};

export type FhirOperationOutcomeIssueSeverity =
  | "fatal"
  | "error"
  | "warning"
  | "information";

export type FhirOperationOutcomeIssueCode =
  | "invalid"
  | "structure"
  | "required"
  | "value"
  | "invariant"
  | "security"
  | "login"
  | "unknown"
  | "expired"
  | "forbidden"
  | "suppressed"
  | "processing"
  | "not-supported"
  | "duplicate"
  | "multiple-matches"
  | "not-found"
  | "deleted"
  | "too-long"
  | "code-invalid"
  | "extension"
  | "too-costly"
  | "business-rule"
  | "conflict"
  | "transient"
  | "lock-error"
  | "no-store"
  | "exception"
  | "timeout"
  | "incomplete"
  | "throttled"
  | "informational";

export type FhirOperationOutcome = {
  readonly resourceType: "OperationOutcome";
  readonly issue: readonly {
    readonly severity: FhirOperationOutcomeIssueSeverity;
    readonly code: FhirOperationOutcomeIssueCode;
    readonly details?: {
      readonly coding?: readonly {
        readonly system: string;
        readonly code: string;
        readonly display?: string;
      }[];
      readonly text?: string;
    };
    readonly diagnostics?: string;
    readonly expression?: readonly string[];
  }[];
};

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

export type FhirBundleEntry = {
  readonly fullUrl: string;
  readonly resource:
    | FhirComposition
    | FhirOrganization
    | FhirPractitioner
    | FhirPractitionerRole
    | FhirEndpoint
    | FhirPatient
    | FhirConsent
    | FhirAuditEvent
    | FhirEncounter
    | FhirCondition
    | FhirObservation
    | FhirAllergyIntolerance
    | FhirMedicationRequest
    | FhirMedicationDispense
    | FhirMedicationAdministration
    | FhirServiceRequest
    | FhirTask
    | FhirProcedure
    | FhirDiagnosticReport
    | FhirImagingStudy
    | FhirDocumentReference
    | FhirProvenance;
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
