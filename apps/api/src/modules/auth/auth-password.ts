import { scrypt, timingSafeEqual } from "node:crypto";

type ScryptPasswordHash = {
  readonly cost: number;
  readonly blockSize: number;
  readonly parallelization: number;
  readonly salt: Buffer;
  readonly derivedKey: Buffer;
};

export const demoPasswordHash =
  "scrypt:16384:8:1:d2lpaWNhcmUtZGVtby1hdXRoLXNhbHQtdjE:k_4STU5_F2Ne92rMSjstTDIgZujDgdfViYgq2R0iMPifdKOjxdqEZGc6-4dFjBJu0nzcTJxnigqz4niK5pgWkQ";

export const dummyPasswordHash =
  "scrypt:16384:8:1:d2lpaWNhcmUtZHVtbXktYXV0aC1zYWx0LXYx:s3nj7mS9HkFG3FW9rgoxFG1MB-ihgGC_qwYnAioQtjR5CjHOz3gQgPaj1vvwqib2Lr4TOA7ZXbdLc4B68SP6XQ";

export async function verifyPassword(
  password: string,
  serializedHash: string
): Promise<boolean> {
  const parsedHash = parseScryptPasswordHash(serializedHash);
  const candidate = await deriveScryptKey(password, parsedHash);

  return (
    candidate.length === parsedHash.derivedKey.length &&
    timingSafeEqual(candidate, parsedHash.derivedKey)
  );
}

function deriveScryptKey(password: string, parsedHash: ScryptPasswordHash): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      parsedHash.salt,
      parsedHash.derivedKey.length,
      {
        N: parsedHash.cost,
        r: parsedHash.blockSize,
        p: parsedHash.parallelization
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      }
    );
  });
}

function parseScryptPasswordHash(serializedHash: string): ScryptPasswordHash {
  const [algorithm, costRaw, blockSizeRaw, parallelizationRaw, saltRaw, derivedKeyRaw, extra] =
    serializedHash.split(":");

  if (
    algorithm !== "scrypt" ||
    !costRaw ||
    !blockSizeRaw ||
    !parallelizationRaw ||
    !saltRaw ||
    !derivedKeyRaw ||
    extra !== undefined
  ) {
    throw new Error("Invalid password hash format.");
  }

  return {
    cost: readPositiveInteger(costRaw, "scrypt cost"),
    blockSize: readPositiveInteger(blockSizeRaw, "scrypt block size"),
    parallelization: readPositiveInteger(parallelizationRaw, "scrypt parallelization"),
    salt: Buffer.from(saltRaw, "base64url"),
    derivedKey: Buffer.from(derivedKeyRaw, "base64url")
  };
}

function readPositiveInteger(value: string, label: string): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`Invalid ${label}.`);
  }

  return parsed;
}
