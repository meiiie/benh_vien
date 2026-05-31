import { z } from "zod";

const dicomUidPattern = /^(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*))*$/;

export const DicomUidSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(dicomUidPattern, "DICOM UID không hợp lệ.");
