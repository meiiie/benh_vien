import { useState } from "react";
import {
  defaultPatientForm,
  defaultPatientMergeForm
} from "../../config/demoClinicalDefaults.js";
import type {
  NewPatientForm,
  Patient,
  PatientMergeForm,
  PatientStatusFilter
} from "../../types/patientRegistry.js";

export function usePatientRegistryState() {
  const [patients, setPatients] = useState<readonly Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>();
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [patientStatusFilter, setPatientStatusFilter] =
    useState<PatientStatusFilter>("all");
  const [patientForm, setPatientForm] = useState<NewPatientForm>(defaultPatientForm);
  const [patientMergeForm, setPatientMergeForm] =
    useState<PatientMergeForm>(defaultPatientMergeForm);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isSubmittingPatient, setIsSubmittingPatient] = useState(false);
  const [isMergingPatient, setIsMergingPatient] = useState(false);

  return {
    clearPatientFilters: () => {
      setPatientSearchTerm("");
      setPatientStatusFilter("all");
    },
    isLoadingPatients,
    isMergingPatient,
    isSubmittingPatient,
    patientForm,
    patientMergeForm,
    patients,
    patientSearchTerm,
    patientStatusFilter,
    selectedPatientId,
    setIsLoadingPatients,
    setIsMergingPatient,
    setIsSubmittingPatient,
    setPatientForm,
    setPatientMergeForm,
    setPatientSearchTerm,
    setPatientStatusFilter,
    setPatients,
    setSelectedPatientId
  };
}
