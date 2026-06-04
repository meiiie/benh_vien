import type {
  NewPatientForm,
  PatientMergeForm
} from "../types/patientRegistry.js";

export const defaultPatientForm: NewPatientForm = {
  fullName: "Trần Minh Hải",
  birthDate: "1992-09-18",
  gender: "male",
  nationalId: "031092000002",
  hospitalMrn: "MRN-HP-0002",
  phone: "0912345678",
  address: "Hải Phòng, Việt Nam",
  managingOrganizationId: "hospital-hai-phong-demo"
};

export const defaultPatientMergeForm: PatientMergeForm = {
  targetPatientId: "patient-demo-001",
  reason:
    "Đối soát MPI xác nhận hồ sơ nguồn bị đăng ký trùng với hồ sơ đích.",
  confirmationText: ""
};
