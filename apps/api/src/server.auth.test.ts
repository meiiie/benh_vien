import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildServer } from "./server.js";

const testSecret = "wiiicare-test-secret-at-least-32-characters";

describe("API auth and RBAC boundary", () => {
  let app: FastifyInstance | undefined;
  const originalRepository = process.env.BVS_REPOSITORY;
  const originalAuthSecret = process.env.BVS_AUTH_SECRET;

  beforeEach(() => {
    process.env.BVS_REPOSITORY = "in-memory";
    process.env.BVS_AUTH_SECRET = testSecret;
  });

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }

    restoreEnv("BVS_REPOSITORY", originalRepository);
    restoreEnv("BVS_AUTH_SECRET", originalAuthSecret);
  });

  it("returns a signed demo session for valid credentials", async () => {
    app = await readyServer();

    const response = await login(app, {
      username: "practitioner-demo-001",
      password: "demo",
      role: "clinician"
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.actor).toMatchObject({
      actorId: "practitioner-demo-001",
      displayName: "Bác sĩ điều trị",
      role: "clinician"
    });
  });

  it("rejects patient access without a Bearer token", async () => {
    app = await readyServer();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients"
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      error: "UNAUTHENTICATED"
    });
  });

  it("allows clinician treatment access to patient registry", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "patient-demo-001",
      fullName: "Nguyễn Văn An"
    });
  });

  it("denies auditor attempts to create clinical data", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients",
      headers: {
        ...auditHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        identifiers: [
          {
            system: "urn:benh-vien-so:mrn",
            value: "MRN-DENIED-TEST",
            type: "hospital-mrn"
          }
        ],
        fullName: "RBAC Denied",
        managingOrganizationId: "hospital-hai-phong-demo"
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:create"
    });
  });

  it("allows auditor audit-purpose access to patient audit events", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events",
      headers: auditHeaders(accessToken)
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      items: expect.any(Array)
    });
  });

  it("denies nurse FHIR export even with treatment purpose", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "nurse-demo-001", "nurse");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:fhir-export"
    });
  });

  it("returns a patient-record FHIR Bundle for treatment export", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: bundleTransferHeaders(accessToken)
    });
    const body = response.json();
    const resourceTypes = body.entry.map(
      (entry: { readonly resource: { readonly resourceType: string } }) =>
        entry.resource.resourceType
    );

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "Bundle",
      id: "patient-record-patient-demo-001",
      type: "collection"
    });
    expect(resourceTypes).toEqual(
      expect.arrayContaining(["Patient", "Encounter", "Condition", "Observation", "DocumentReference"])
    );
    expect(body.entry).toHaveLength(10);
  });

  it("lists conditions and exports them as FHIR Condition", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/conditions",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/conditions/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Condition",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates a condition attached to the selected patient encounter", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/conditions",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        category: "encounter-diagnosis",
        code: {
          system: "http://hl7.org/fhir/sid/icd-10",
          code: "R50.9",
          display: "Sốt chưa rõ nguyên nhân"
        },
        severity: "mild",
        onsetAt: "2026-05-27T00:00:00.000Z",
        recorderPractitionerId: "practitioner-demo-001",
        note: "Chẩn đoán thử nghiệm trong API test."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      category: "encounter-diagnosis"
    });
  });

  it("lists observations and exports them as FHIR Observation", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/observations",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/observations/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Observation",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates an observation attached to the selected patient encounter", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/observations",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        category: "vital-signs",
        code: {
          system: "http://loinc.org",
          code: "8867-4",
          display: "Heart rate"
        },
        effectiveAt: "2026-05-27T04:00:00.000Z",
        valueQuantity: {
          value: 78,
          unit: "/min",
          system: "http://unitsofmeasure.org",
          code: "/min"
        },
        performerPractitionerId: "nurse-demo-001"
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      category: "vital-signs"
    });
  });

  it("lists active patient consents for treatment users", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/consents",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "consent-demo-transfer-001",
      patientId: "patient-demo-001",
      status: "active",
      category: "record-sharing",
      granteeOrganizationId: "hospital-hai-phong-referral"
    });
  });

  it("creates a patient consent and uses it for Bundle export", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/consents",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        category: "record-sharing",
        granteeOrganizationId: "hospital-new-recipient",
        validFrom: "2026-05-27T00:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z"
      }
    });
    const createdConsent = createResponse.json();

    expect(createResponse.statusCode).toBe(201);
    expect(createdConsent.id).toEqual(expect.stringMatching(/^consent-/));

    const bundleResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-consent-reference": createdConsent.id,
        "x-recipient-organization-id": "hospital-new-recipient"
      }
    });

    expect(bundleResponse.statusCode).toBe(200);
    expect(bundleResponse.json()).toMatchObject({
      resourceType: "Bundle",
      type: "collection"
    });
  });

  it("requires transfer context before exporting a patient-record FHIR Bundle", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: treatmentHeaders(accessToken)
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "MISSING_BUNDLE_TRANSFER_CONTEXT"
    });
  });

  it("denies Bundle export when consent does not match the recipient", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-consent-reference": "consent-demo-transfer-001",
        "x-recipient-organization-id": "hospital-not-covered"
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "CONSENT_NOT_VALID_FOR_TRANSFER"
    });
  });
});

async function readyServer(): Promise<FastifyInstance> {
  const server = await buildServer({
    logger: false
  });
  await server.ready();
  return server;
}

async function login(
  app: FastifyInstance,
  payload: {
    readonly username: string;
    readonly password: string;
    readonly role: string;
  }
) {
  return app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    headers: {
      "content-type": "application/json"
    },
    payload
  });
}

async function loginForToken(
  app: FastifyInstance,
  username: string,
  role: string
): Promise<string> {
  const response = await login(app, {
    username,
    password: "demo",
    role
  });

  expect(response.statusCode).toBe(200);

  return response.json().accessToken as string;
}

function treatmentHeaders(accessToken: string): Record<string, string> {
  return {
    authorization: `Bearer ${accessToken}`,
    "x-purpose-of-use": "TREATMENT"
  };
}

function bundleTransferHeaders(accessToken: string): Record<string, string> {
  return {
    ...treatmentHeaders(accessToken),
    "x-consent-reference": "consent-demo-transfer-001",
    "x-recipient-organization-id": "hospital-hai-phong-referral"
  };
}

function auditHeaders(accessToken: string): Record<string, string> {
  return {
    authorization: `Bearer ${accessToken}`,
    "x-purpose-of-use": "AUDIT"
  };
}

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
