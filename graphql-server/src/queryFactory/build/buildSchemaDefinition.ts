import { SchemaType } from "../../schemas/schema.enums";

export function postgresSchemaDefinitionSql(
  name: string,
  kind: SchemaType,
  dbName: string,
  schemaName: string,
): string {
  const esc = (s: string) => s.replace(/'/g, "''");
  switch (kind) {
    case SchemaType.Table:
      return `SELECT ordinal_position, column_name, udt_name as data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = '${esc(schemaName)}' AND table_catalog = '${esc(dbName)}' AND table_name = '${esc(name)}'`;
    case SchemaType.View:
      return `SELECT pg_get_viewdef('${esc(schemaName)}.${esc(name)}'::regclass, true)`;
    case SchemaType.Trigger:
      return `SELECT pg_get_triggerdef(oid) FROM pg_trigger where tgname = '${esc(name)}'`;
    case SchemaType.Event:
      return `SELECT * FROM pg_event_trigger WHERE evtname = '${esc(name)}'`;
    case SchemaType.Procedure:
      return `SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = '${esc(name)}'`;
    default:
      return "";
  }
}
