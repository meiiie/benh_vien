import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  ConsentRepository,
  PatientRepository
} from "@benh-vien-so/domain";
import type { LoadPatientRecordBundleCollectionsInput } from "./patient-record-bundle-collections.js";
import type { PatientRecordBundleType } from "./patient-record-bundle-error-responses.js";

export type PreparePatientRecordBundleContextInput =
  LoadPatientRecordBundleCollectionsInput & {
    readonly request: FastifyRequest;
    readonly reply: FastifyReply;
    readonly actor: ActorContext;
    readonly patientId: string;
    readonly patientRepository: PatientRepository;
    readonly consentRepository: ConsentRepository;
    readonly bundleType: PatientRecordBundleType;
  };
