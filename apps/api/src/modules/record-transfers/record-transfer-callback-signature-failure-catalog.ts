export const callbackSignatureFailureCatalog = {
  signatureRequired: {
    statusCode: 403,
    error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_REQUIRED",
    message:
      "Callback xác nhận nhận hồ sơ phải có timestamp và chữ ký HMAC hợp lệ."
  },
  signatureInvalid: {
    statusCode: 403,
    error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_INVALID",
    message: "Chữ ký callback không hợp lệ."
  },
  timestampInvalid: {
    statusCode: 403,
    error: "RECORD_TRANSFER_CALLBACK_TIMESTAMP_INVALID",
    message: "Timestamp của callback không phải thời điểm ISO-8601 hợp lệ."
  },
  timestampExpired: {
    statusCode: 403,
    error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_EXPIRED",
    message: "Timestamp của callback nằm ngoài cửa sổ chấp nhận 5 phút."
  }
} as const;

export const callbackSignatureInvalidLengthMessage =
  "Chữ ký callback vượt quá độ dài cho phép.";

export const callbackSignatureMismatchMessage =
  "Chữ ký callback không khớp payload tiếp nhận.";
