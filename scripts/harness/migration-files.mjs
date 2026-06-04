import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const migrationsDir = resolve("migrations");
const migrationNamePattern = /^(?<number>\d{3})_[a-z0-9]+(?:_[a-z0-9]+)*\.sql$/;
const migrationFiles = (await readdir(migrationsDir))
  .filter((file) => file.endsWith(".sql"))
  .sort();

if (migrationFiles.length === 0) {
  throw new Error("Expected at least one SQL migration file.");
}

const invalidNames = migrationFiles.filter((file) => !migrationNamePattern.test(file));

if (invalidNames.length > 0) {
  throw new Error(
    `Migration filenames must match NNN_snake_case.sql: ${invalidNames.join(", ")}`
  );
}

const numbers = migrationFiles.map((file) => Number.parseInt(file.slice(0, 3), 10));
const duplicateNumbers = numbers.filter((number, index) => numbers.indexOf(number) !== index);

if (duplicateNumbers.length > 0) {
  throw new Error(
    `Migration numbers must be unique: ${[...new Set(duplicateNumbers)]
      .map((number) => String(number).padStart(3, "0"))
      .join(", ")}`
  );
}

const expectedNumbers = Array.from({ length: migrationFiles.length }, (_, index) => index + 1);
const missingOrOutOfOrderNumbers = expectedNumbers.filter(
  (expectedNumber, index) => numbers[index] !== expectedNumber
);

if (missingOrOutOfOrderNumbers.length > 0) {
  throw new Error(
    `Migration numbers must be contiguous from 001. Observed sequence: ${numbers
      .map((number) => String(number).padStart(3, "0"))
      .join(", ")}`
  );
}

const emptyFiles = [];

for (const file of migrationFiles) {
  const sql = await readFile(join(migrationsDir, file), "utf8");

  if (sql.trim().length === 0) {
    emptyFiles.push(file);
  }
}

if (emptyFiles.length > 0) {
  throw new Error(`Migration files must not be empty: ${emptyFiles.join(", ")}`);
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "SQL migration filename, ordering and content policy",
      migrationsDir,
      migrationCount: migrationFiles.length,
      firstMigration: migrationFiles[0],
      latestMigration: migrationFiles.at(-1)
    },
    null,
    2
  )
);
