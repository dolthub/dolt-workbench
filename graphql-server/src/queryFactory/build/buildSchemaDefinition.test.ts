import { SchemaType } from "../../schemas/schema.enums";
import { postgresSchemaDefinitionSql } from "./buildSchemaDefinition";

describe("postgresSchemaDefinitionSql", () => {
  it("emits table definition query", () => {
    expect(
      postgresSchemaDefinitionSql("users", SchemaType.Table, "mydb", "public"),
    ).toBe(
      "SELECT ordinal_position, column_name, udt_name as data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_catalog = 'mydb' AND table_name = 'users'",
    );
  });

  it("emits view definition query", () => {
    expect(
      postgresSchemaDefinitionSql("myview", SchemaType.View, "mydb", "public"),
    ).toBe("SELECT pg_get_viewdef('public.myview'::regclass, true)");
  });

  it("emits trigger definition query", () => {
    expect(
      postgresSchemaDefinitionSql("trig", SchemaType.Trigger, "mydb", "public"),
    ).toBe(
      "SELECT pg_get_triggerdef(oid) FROM pg_trigger where tgname = 'trig'",
    );
  });

  it("emits event definition query", () => {
    expect(
      postgresSchemaDefinitionSql("evt", SchemaType.Event, "mydb", "public"),
    ).toBe("SELECT * FROM pg_event_trigger WHERE evtname = 'evt'");
  });

  it("emits procedure definition query", () => {
    expect(
      postgresSchemaDefinitionSql(
        "proc",
        SchemaType.Procedure,
        "mydb",
        "public",
      ),
    ).toBe(
      "SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'proc'",
    );
  });

  it("escapes single quotes in identifiers", () => {
    expect(
      postgresSchemaDefinitionSql(
        "o'brien",
        SchemaType.View,
        "mydb",
        "sch'ema",
      ),
    ).toBe("SELECT pg_get_viewdef('sch''ema.o''brien'::regclass, true)");
  });
});
