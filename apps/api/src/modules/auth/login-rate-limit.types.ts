export type LoginRateLimitDecision =
  | {
      readonly limited: false;
    }
  | {
      readonly limited: true;
      readonly retryAfterSeconds: number;
    };

export type LoginRateLimiter = {
  consume(key: string): Promise<LoginRateLimitDecision>;
  check(): Promise<LoginRateLimitHealth>;
  close?(): Promise<void>;
};

export type LoginRateLimitHealth =
  | {
      readonly status: "ok";
      readonly store: "memory" | "valkey";
    }
  | {
      readonly status: "error";
      readonly store: "valkey";
      readonly message: string;
    };

export type LoginRateLimitConfig = {
  readonly maxAttempts: number;
  readonly windowMs: number;
};

export type ValkeyLoginRateLimitClient = {
  readonly isOpen?: boolean;
  on?(event: "error", listener: (error: unknown) => void): unknown;
  connect(): Promise<unknown>;
  ping?(): Promise<unknown>;
  eval(
    script: string,
    options: {
      readonly keys: readonly string[];
      readonly arguments: readonly string[];
    }
  ): Promise<unknown>;
  quit?(): Promise<unknown>;
  disconnect?(): Promise<void>;
};
