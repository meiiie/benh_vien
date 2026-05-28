const baseUrl = normalizeBaseUrl(
  process.env.WIIICARE_SMOKE_BASE_URL ?? "http://localhost:7310/api/v1"
);
const requestTag = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const adminSession = await login("admin-demo", "admin");
const clinicianSession = await login("practitioner-demo-001", "clinician");
const auditorSession = await login("security-officer-demo", "auditor");

const invalidLogin = await requestJson("/auth/login", {
  method: "POST",
  expectedStatus: 401,
  headers: {
    "x-request-id": "postgres-smoke-auth-invalid"
  },
  body: {
    username: `unknown-smoke-${requestTag}`,
    password: "wrong-password",
    role: "clinician"
  }
});

if (invalidLogin.error !== "INVALID_CREDENTIALS") {
  throw new Error(
    `Expected invalid login to return INVALID_CREDENTIALS, received ${invalidLogin.error}.`
  );
}

const clinicianPatients = await requestJson("/patients", {
  token: clinicianSession.accessToken,
  headers: treatmentHeaders()
});
const clinicianPatientIds = clinicianPatients.items.map((patient) => patient.id);

if (!clinicianPatientIds.includes("patient-demo-001")) {
  throw new Error("Expected clinician to see seeded treatment patient patient-demo-001.");
}

const fhirPatient = await requestJson("/patients/patient-demo-001/fhir", {
  token: clinicianSession.accessToken,
  headers: treatmentHeaders()
});

if (fhirPatient.resourceType !== "Patient") {
  throw new Error(`Expected FHIR Patient, received ${fhirPatient.resourceType}.`);
}

const outsidePatient = await requestJson("/patients", {
  method: "POST",
  token: adminSession.accessToken,
  headers: treatmentHeaders(),
  expectedStatus: 201,
  body: {
    identifiers: [
      {
        system: "urn:benh-vien-so:mrn",
        value: `MRN-SMOKE-${requestTag}`,
        type: "hospital-mrn"
      }
    ],
    fullName: "Authenticated Smoke Outside Patient",
    gender: "unknown",
    managingOrganizationId: "hospital-outside-smoke"
  }
});

const outsideEncounter = await requestJson(`/patients/${outsidePatient.id}/encounters`, {
  method: "POST",
  token: adminSession.accessToken,
  headers: treatmentHeaders(),
  expectedStatus: 201,
  body: {
    class: "ambulatory",
    serviceType: "Authenticated PostgreSQL smoke",
    reasonText: "Runtime smoke outside encounter for ABAC verification.",
    attendingPractitionerId: "practitioner-demo-003",
    startedAt: "2026-05-28T04:00:00.000Z"
  }
});

const outsideCondition = await requestJson(`/patients/${outsidePatient.id}/conditions`, {
  method: "POST",
  token: adminSession.accessToken,
  headers: treatmentHeaders(),
  expectedStatus: 201,
  body: {
    encounterId: outsideEncounter.id,
    category: "encounter-diagnosis",
    code: {
      system: "http://hl7.org/fhir/sid/icd-10",
      code: "J18.9",
      display: "Pneumonia, unspecified organism"
    },
    recorderPractitionerId: "practitioner-demo-003"
  }
});

const outsideMedicationRequest = await requestJson(
  `/patients/${outsidePatient.id}/medication-requests`,
  {
    method: "POST",
    token: adminSession.accessToken,
    headers: treatmentHeaders(),
    expectedStatus: 201,
    body: {
      encounterId: outsideEncounter.id,
      reasonConditionId: outsideCondition.id,
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "J01CA04",
        display: "Amoxicillin"
      },
      dosageInstruction: {
        text: "Take 500 mg every 8 hours",
        route: "Oral route",
        doseQuantity: {
          value: 500,
          unit: "mg",
          system: "http://unitsofmeasure.org",
          code: "mg"
        },
        frequency: 3,
        period: 1,
        periodUnit: "d"
      },
      requesterPractitionerId: "practitioner-demo-003",
      expectedSupplyDurationDays: 7
    }
  }
);

const clinicianPatientsAfterOutsideCreate = await requestJson("/patients", {
  token: clinicianSession.accessToken,
  headers: treatmentHeaders()
});
const visiblePatientIdsAfterOutsideCreate =
  clinicianPatientsAfterOutsideCreate.items.map((patient) => patient.id);

if (visiblePatientIdsAfterOutsideCreate.includes(outsidePatient.id)) {
  throw new Error("Clinician should not see outside organization patient in patient registry.");
}

const deniedMedicationList = await requestJson(
  `/patients/${outsidePatient.id}/medication-requests`,
  {
    token: clinicianSession.accessToken,
    headers: {
      ...treatmentHeaders(),
      "x-request-id": "postgres-smoke-medication-list-denied"
    },
    expectedStatus: 403
  }
);

const deniedMedicationExport = await requestJson(
  `/medication-requests/${outsideMedicationRequest.id}/fhir`,
  {
    token: clinicianSession.accessToken,
    headers: {
      ...treatmentHeaders(),
      "x-request-id": "postgres-smoke-medication-export-denied"
    },
    expectedStatus: 403
  }
);

if (deniedMedicationList.error !== "PATIENT_ACCESS_DENIED") {
  throw new Error(
    `Expected medication list denial PATIENT_ACCESS_DENIED, received ${deniedMedicationList.error}.`
  );
}

if (deniedMedicationExport.error !== "PATIENT_ACCESS_DENIED") {
  throw new Error(
    `Expected medication export denial PATIENT_ACCESS_DENIED, received ${deniedMedicationExport.error}.`
  );
}

const deniedGlobalPatientList = await requestJson("/patients", {
  token: auditorSession.accessToken,
  headers: {
    ...treatmentHeaders(),
    "x-request-id": "postgres-smoke-global-patient-list-denied"
  },
  expectedStatus: 403
});

if (deniedGlobalPatientList.error !== "FORBIDDEN") {
  throw new Error(
    `Expected global patient list denial FORBIDDEN, received ${deniedGlobalPatientList.error}.`
  );
}

const fhirValidationOutcome = await requestJson("/audit-events?limit=0", {
  token: auditorSession.accessToken,
  headers: {
    ...auditHeaders(),
    accept: "application/fhir+json",
    "x-request-id": "postgres-smoke-fhir-validation-error"
  },
  expectedStatus: 400
});

if (
  fhirValidationOutcome.resourceType !== "OperationOutcome" ||
  fhirValidationOutcome.issue?.[0]?.code !== "invalid" ||
  fhirValidationOutcome.issue?.[0]?.details?.coding?.[0]?.code !== "VALIDATION_ERROR"
) {
  throw new Error("Expected FHIR validation failure to return OperationOutcome invalid issue.");
}

const missingTransferJson = await requestJson("/record-transfers/record-transfer-smoke-missing", {
  token: clinicianSession.accessToken,
  headers: treatmentHeaders(),
  expectedStatus: 404
});

if (missingTransferJson.error !== "RECORD_TRANSFER_NOT_FOUND") {
  throw new Error(
    `Expected missing JSON record transfer to return RECORD_TRANSFER_NOT_FOUND, received ${missingTransferJson.error}.`
  );
}

const missingTransferFhir = await requestJson(
  "/record-transfers/record-transfer-smoke-missing/fhir-task",
  {
    token: clinicianSession.accessToken,
    headers: treatmentHeaders(),
    expectedStatus: 404
  }
);

if (
  missingTransferFhir.resourceType !== "OperationOutcome" ||
  missingTransferFhir.issue?.[0]?.code !== "not-found" ||
  missingTransferFhir.issue?.[0]?.details?.coding?.[0]?.code !== "RECORD_TRANSFER_NOT_FOUND"
) {
  throw new Error("Expected missing FHIR record transfer Task to return OperationOutcome not-found.");
}

const providerDirectory = await requestJson("/provider-directory", {
  token: clinicianSession.accessToken,
  headers: treatmentHeaders()
});
const referralFhirEndpoint = providerDirectory.endpoints?.find(
  (endpoint) =>
    endpoint.id === "endpoint-fhir-hai-phong-referral" &&
    endpoint.managingOrganizationId === "hospital-hai-phong-referral" &&
    endpoint.status === "active" &&
    endpoint.connectionType === "hl7-fhir-rest" &&
    endpoint.payloadTypes?.some(
      (payloadType) =>
        payloadType.system === "http://hl7.org/fhir/resource-types" &&
        payloadType.code === "Bundle"
    )
);

if (!referralFhirEndpoint) {
  throw new Error("Expected referral hospital to expose an active FHIR Bundle endpoint.");
}

const smokeTransfer = await requestJson("/patients/patient-demo-001/record-transfers", {
  method: "POST",
  token: clinicianSession.accessToken,
  headers: treatmentHeaders(),
  expectedStatus: 201,
  body: {
    priority: "urgent",
    bundleType: "document",
    sourceOrganizationId: "hospital-hai-phong-demo",
    recipientOrganizationId: "hospital-hai-phong-referral",
    consentReference: "consent-demo-transfer-001",
    reason: `Authenticated smoke transfer retry ${requestTag}`
  }
});
const smokeTransferSentAt = new Date(Date.now() + 60_000).toISOString();
const smokeTransferFailedAt = new Date(Date.now() + 120_000).toISOString();
const smokeTransferNextRetryAt = new Date(Date.now() + 180_000).toISOString();
const smokeTransferRetryAt = smokeTransferNextRetryAt;

await requestJson(`/record-transfers/${smokeTransfer.id}/send`, {
  method: "POST",
  token: clinicianSession.accessToken,
  headers: treatmentHeaders(),
  body: {
    sentAt: smokeTransferSentAt
  }
});

const smokeTransferAttemptsAfterSend = await requestJson(
  `/record-transfers/${smokeTransfer.id}/delivery-attempts`,
  {
    token: clinicianSession.accessToken,
    headers: treatmentHeaders()
  }
);

if (
  smokeTransferAttemptsAfterSend.items?.length !== 1 ||
  smokeTransferAttemptsAfterSend.items[0]?.status !== "queued" ||
  smokeTransferAttemptsAfterSend.items[0]?.targetEndpointId !==
    "endpoint-fhir-hai-phong-referral" ||
  !/^wiiicare-record-transfer-[a-f0-9]{64}$/.test(
    smokeTransferAttemptsAfterSend.items[0]?.idempotencyKey ?? ""
  )
) {
  throw new Error("Expected record transfer send to queue one delivery attempt.");
}

const failedTransfer = await requestJson(`/record-transfers/${smokeTransfer.id}/fail`, {
  method: "POST",
  token: clinicianSession.accessToken,
  headers: treatmentHeaders(),
  body: {
    failedAt: smokeTransferFailedAt,
    failureReason: "Authenticated smoke recipient gateway unavailable.",
    nextRetryAt: smokeTransferNextRetryAt
  }
});

if (
  failedTransfer.status !== "failed" ||
  failedTransfer.failureReason !== "Authenticated smoke recipient gateway unavailable."
) {
  throw new Error("Expected record transfer fail endpoint to store failed delivery metadata.");
}

const retriedTransfer = await requestJson(`/record-transfers/${smokeTransfer.id}/retry`, {
  method: "POST",
  token: clinicianSession.accessToken,
  headers: treatmentHeaders(),
  body: {
    retryAt: smokeTransferRetryAt
  }
});

if (
  retriedTransfer.status !== "ready" ||
  retriedTransfer.retryCount !== 1 ||
  "sentAt" in retriedTransfer ||
  "failedAt" in retriedTransfer
) {
  throw new Error("Expected record transfer retry endpoint to return ready state and clear failed attempt timestamps.");
}

await requestJson(`/record-transfers/${smokeTransfer.id}/send`, {
  method: "POST",
  token: clinicianSession.accessToken,
  headers: treatmentHeaders(),
  body: {
    sentAt: new Date(Date.now() + 240_000).toISOString()
  }
});

const smokeTransferAttemptsAfterRetry = await requestJson(
  `/record-transfers/${smokeTransfer.id}/delivery-attempts`,
  {
    token: clinicianSession.accessToken,
    headers: treatmentHeaders()
  }
);

if (
  smokeTransferAttemptsAfterRetry.items?.length !== 2 ||
  smokeTransferAttemptsAfterRetry.items[1]?.attemptNumber !== 2
) {
  throw new Error("Expected retried record transfer send to queue a second delivery attempt.");
}

const receivedTransfer = await requestJson(`/record-transfers/${smokeTransfer.id}/receive`, {
  method: "POST",
  token: clinicianSession.accessToken,
  headers: treatmentHeaders(),
  body: {
    receivedAt: new Date(Date.now() + 300_000).toISOString(),
    note: "Authenticated smoke recipient acknowledgement."
  }
});

if (
  receivedTransfer.status !== "completed" ||
  receivedTransfer.receivedByActorId !== "practitioner-demo-001" ||
  !/^wiiicare-record-transfer-ack-[a-f0-9]{32}$/.test(
    receivedTransfer.acknowledgementReference ?? ""
  )
) {
  throw new Error("Expected record transfer receive endpoint to store acknowledgement metadata.");
}

const globalAuditTrail = await waitForAuditTrail(
  "/audit-events?limit=100",
  {
    token: auditorSession.accessToken,
    headers: auditHeaders()
  },
  (auditTrail) =>
    auditTrail.items.some(
      (event) =>
        event.action === "access.denied" &&
        event.patientId === undefined &&
        event.resourceId === "patient:list" &&
        event.metadata?.requestId === "postgres-smoke-global-patient-list-denied"
    ),
  "Expected global denied patient list access to be visible in audit trail."
);

const authAuditEvents = globalAuditTrail.items.filter((event) =>
  event.action.startsWith("auth.login.")
);

if (
  !authAuditEvents.some(
    (event) =>
      event.action === "auth.login.failure" &&
      event.actorId === "anonymous" &&
      event.metadata?.requestId === "postgres-smoke-auth-invalid" &&
      event.metadata?.reason === "INVALID_CREDENTIALS" &&
      typeof event.metadata?.usernameHash === "string" &&
      !("username" in event.metadata)
  )
) {
  throw new Error(
    "Expected failed login attempt to be visible without raw username in audit trail."
  );
}

if (
  !authAuditEvents.some(
    (event) =>
      event.action === "auth.login.success" &&
      event.actorId === "practitioner-demo-001" &&
      event.metadata?.actorRole === "clinician" &&
      typeof event.metadata?.usernameHash === "string" &&
      !("username" in event.metadata)
  )
) {
  throw new Error(
    "Expected successful clinician login to be visible without raw username in audit trail."
  );
}

const outsideAuditTrail = await waitForAuditTrail(
  `/patients/${outsidePatient.id}/audit-events`,
  {
    token: auditorSession.accessToken,
    headers: auditHeaders()
  },
  (auditTrail) =>
    auditTrail.items.some(
      (event) =>
        event.action === "access.denied" &&
        event.patientId === outsidePatient.id &&
        event.metadata?.requestId === "postgres-smoke-medication-list-denied" &&
        event.metadata?.denialCode === "PATIENT_ACCESS_DENIED"
    ),
  "Expected denied medication list access to be captured in audit trail."
);
const deniedAuditEvents = outsideAuditTrail.items.filter(
  (event) => event.action === "access.denied"
);

const outsideAuditBundle = await requestJson(
  `/patients/${outsidePatient.id}/audit-events/fhir-bundle`,
  {
    token: auditorSession.accessToken,
    headers: auditHeaders()
  }
);
const deniedFhirAuditEvents = outsideAuditBundle.entry
  .map((entry) => entry.resource)
  .filter((resource) =>
    resource.subtype?.some((subtype) => subtype.code === "access.denied")
  );

if (
  !deniedFhirAuditEvents.some(
    (resource) => resource.action === "E" && resource.outcome === "4"
  )
) {
  throw new Error("Expected denied access audit to export as a failed FHIR AuditEvent.");
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "Authenticated API and patient ABAC smoke",
      baseUrl,
      visibleSeedPatientIds: clinicianPatientIds,
      outsidePatientId: outsidePatient.id,
      outsideMedicationRequestId: outsideMedicationRequest.id,
      deniedMedicationListStatus: 403,
      deniedMedicationExportStatus: 403,
      deniedMedicationError: deniedMedicationExport.error,
      fhirValidationIssueCode: fhirValidationOutcome.issue[0]?.code,
      missingRecordTransferFhirIssueCode: missingTransferFhir.issue[0]?.code,
      referralFhirEndpointId: referralFhirEndpoint.id,
      retriedRecordTransferId: retriedTransfer.id,
      retriedRecordTransferRetryCount: retriedTransfer.retryCount,
      receivedRecordTransferAcknowledgementReference:
        receivedTransfer.acknowledgementReference,
      recordTransferDeliveryAttemptCount: smokeTransferAttemptsAfterRetry.items.length,
      globalAuditEventCount: globalAuditTrail.items.length,
      authAuditEventCount: authAuditEvents.length,
      deniedAuditEventCount: deniedAuditEvents.length,
      deniedFhirAuditEventCount: deniedFhirAuditEvents.length
    },
    null,
    2
  )
);

async function login(username, role) {
  const response = await requestJson("/auth/login", {
    method: "POST",
    expectedStatus: 200,
    body: {
      username,
      password: "demo",
      role
    }
  });

  if (typeof response.accessToken !== "string" || response.accessToken.length === 0) {
    throw new Error(`Login for ${username} did not return an access token.`);
  }

  return response;
}

async function requestJson(
  path,
  { method = "GET", token, headers = {}, body, expectedStatus = 200 } = {}
) {
  const requestHeaders = {
    accept: "application/json",
    ...headers
  };

  if (token) {
    requestHeaders.authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    requestHeaders["content-type"] = "application/json";
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : undefined;

  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected ${method} ${path} to return ${expectedStatus}, received ${response.status}: ${text}`
    );
  }

  return payload;
}

async function waitForAuditTrail(path, requestOptions, predicate, errorMessage) {
  const deadline = Date.now() + 5_000;
  let latestAuditTrail;

  while (Date.now() < deadline) {
    latestAuditTrail = await requestJson(path, requestOptions);

    if (predicate(latestAuditTrail)) {
      return latestAuditTrail;
    }

    await sleep(100);
  }

  const latestCount = Array.isArray(latestAuditTrail?.items)
    ? latestAuditTrail.items.length
    : 0;
  throw new Error(`${errorMessage} Last observed audit event count: ${latestCount}.`);
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function treatmentHeaders() {
  return {
    "x-purpose-of-use": "TREATMENT"
  };
}

function auditHeaders() {
  return {
    "x-purpose-of-use": "AUDIT"
  };
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}
