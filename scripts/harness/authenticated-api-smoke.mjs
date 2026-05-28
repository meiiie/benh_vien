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
