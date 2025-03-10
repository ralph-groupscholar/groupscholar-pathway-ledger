import { Client } from "pg";
import { loadDbConfig } from "./config";

export async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const config = loadDbConfig();
  const client = new Client(config);
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}
