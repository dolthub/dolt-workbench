import { QueryRunner } from "typeorm";
import { DBArgs } from "../types";
import { setSearchPath } from "./queries";

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

export async function changeSchema(
  qr: QueryRunner,
  schemaName: string,
): Promise<void> {
  await qr.query(setSearchPath(schemaName));
}
