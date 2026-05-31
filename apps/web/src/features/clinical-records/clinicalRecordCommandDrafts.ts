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
