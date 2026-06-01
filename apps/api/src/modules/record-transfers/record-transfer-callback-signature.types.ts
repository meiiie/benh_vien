export type CallbackSignatureAlgorithm = "HMAC-SHA256";

export type CallbackSignatureVerification =
  | {
      readonly required: false;
      readonly verified: false;
      readonly algorithm?: undefined;
      readonly timestamp?: undefined;
      readonly keyId?: undefined;
    }
  | {
      readonly required: true;
      readonly verified: true;
      readonly algorithm: CallbackSignatureAlgorithm;
      readonly timestamp: string;
      readonly keyId?: string;
    }
  | {
      readonly required: true;
      readonly verified: false;
      readonly algorithm?: CallbackSignatureAlgorithm;
      readonly timestamp?: string;
      readonly keyId?: string;
      readonly statusCode: 403 | 503;
      readonly error: string;
      readonly message: string;
    };

export type CallbackSecretLookup =
  | {
      readonly secret: string | undefined;
      readonly keyId?: string;
    }
  | {
      readonly error: string;
      readonly errorCode: string;
      readonly statusCode: 403 | 503;
      readonly keyId?: string;
    };
