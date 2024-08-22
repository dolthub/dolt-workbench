import { QueryRunner } from "typeorm";
import { DBArgs } from "../types";

export async function getSchema(
  qr: QueryRunner,
  args: DBArgs & {
    schemaName?: string;
  },
): Promise<string> {
  if (args.schemaName) return args.schemaName;
  const currentSchemas = await qr.getSchemas(args.databaseName);
  if (!currentSchemas.length) return "public";
  return currentSchemas[0];
}
