export {
  readAuthenticatedActorIdentity,
  type AuthenticatedActorIdentity
} from "./access-context-authenticated-actor.js";
export { readActorContext } from "./access-context-reader.js";
export { requirePermission } from "./access-permission.js";
export {
  filterPatientsByAccess,
  requirePatientRecordAccess,
  requirePatientRecordAccessByPatientId
} from "./patient-record-access.js";
