import { z } from "zod";

/**
 * -- Zod schema for client environment variables. --
 *
 * Client environment variables that are exposed to the browser
 * MUST be prefixed with `NEXT_PUBLIC_`.
 *
 * Throws an error if any required variable is missing or invalid.
 */
const EnvSchema = z
  .object({
    // Backend API URL for the Lunalight server.
    NEXT_PUBLIC_API_URL: z
      .url()
      .describe(
        "Backend API URL for the Lunalight server including the version prefix.",
      ),
  })
  .describe("Client environment variables schema.");

/**
 * Parses and validates client environment variables.
 *
 * Next.js requires explicit access to process.env variables,
 * we need to pass them explicitly to the schema parser.
 */
const env = EnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

export type Env = z.infer<typeof EnvSchema>;
export default env;
