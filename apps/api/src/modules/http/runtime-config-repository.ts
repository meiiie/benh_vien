export function assertRepositoryConfiguration(): void {
  const repository = process.env.BVS_REPOSITORY ?? "in-memory";

  if (repository !== "postgres" && repository !== "in-memory") {
    throw new Error("BVS_REPOSITORY must be either 'postgres' or 'in-memory'.");
  }

  if (process.env.NODE_ENV === "production" && repository !== "postgres") {
    throw new Error("BVS_REPOSITORY must be 'postgres' in production.");
  }
}
