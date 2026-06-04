export type CommandDraft<TCommand> =
  | {
      readonly ok: true;
      readonly command: TCommand;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

export type NumberDraft =
  | {
      readonly ok: true;
      readonly value: number;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

export type StringDraft =
  | {
      readonly ok: true;
      readonly value: string;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

export type OptionalStringDraft =
  | {
      readonly ok: true;
      readonly value: string | undefined;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

export const fhirUnsignedIntMax = 2_147_483_647;

const dicomUidPattern = /^(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*))*$/;

export function parseFiniteNumber(rawValue: string, message: string): NumberDraft {
  const value = Number(rawValue);

  if (!Number.isFinite(value)) {
    return {
      ok: false,
      message
    };
  }

  return {
    ok: true,
    value
  };
}

export function parsePositiveNumber(rawValue: string, message: string): NumberDraft {
  const value = Number(rawValue);

  if (!Number.isFinite(value) || value <= 0) {
    return {
      ok: false,
      message
    };
  }

  return {
    ok: true,
    value
  };
}

export function parseOptionalPositiveNumber(
  rawValue: string,
  message: string
): NumberDraft | { readonly ok: true; readonly value: undefined } {
  if (!rawValue) {
    return {
      ok: true,
      value: undefined
    };
  }

  return parsePositiveNumber(rawValue, message);
}

export function parseOptionalFhirUnsignedInt(
  rawValue: string,
  message: string
): NumberDraft | { readonly ok: true; readonly value: undefined } {
  const normalizedValue = rawValue.trim();

  if (!normalizedValue) {
    return {
      ok: true,
      value: undefined
    };
  }

  const value = Number(normalizedValue);

  if (
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value < 0 ||
    value > fhirUnsignedIntMax
  ) {
    return {
      ok: false,
      message
    };
  }

  return {
    ok: true,
    value
  };
}

export function parseOptionalApiDateTime(
  rawValue: string,
  message: string
): OptionalStringDraft {
  if (!rawValue) {
    return {
      ok: true,
      value: undefined
    };
  }

  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    return {
      ok: false,
      message
    };
  }

  return {
    ok: true,
    value: date.toISOString()
  };
}

export function parseDicomUid(rawValue: string, message: string): StringDraft {
  const value = rawValue.trim();

  if (!value || value.length > 64 || !dicomUidPattern.test(value)) {
    return {
      ok: false,
      message
    };
  }

  return {
    ok: true,
    value
  };
}
