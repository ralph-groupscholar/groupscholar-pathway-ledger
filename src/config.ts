export type DbConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: { rejectUnauthorized: boolean };
};

const REQUIRED_ENV = ["PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD"] as const;

type RequiredKey = (typeof REQUIRED_ENV)[number];

export function loadDbConfig(): DbConfig {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing database environment variables: ${missing.join(", ")}. ` +
        "Set them before running the CLI."
    );
  }

  const get = (key: RequiredKey) => process.env[key] as string;

  const sslMode = process.env.PGSSLMODE;
  const sslEnabled = sslMode ? sslMode !== "disable" : false;

  return {
    host: get("PGHOST"),
    port: Number(get("PGPORT")),
    database: get("PGDATABASE"),
    user: get("PGUSER"),
    password: get("PGPASSWORD"),
    ssl: sslEnabled ? { rejectUnauthorized: false } : undefined
  };
}
