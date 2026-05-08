import { DataSource, EntityManager } from "typeorm";
import { buildDropTable } from "./buildDropTable";

const mysqlEm = new EntityManager(
  new DataSource({ type: "mysql", host: "", database: "" }),
);
const pgEm = new EntityManager(
  new DataSource({ type: "postgres", host: "", database: "" }),
);

describe("buildDropTable", () => {
  describe("mysql", () => {
    it("emits DROP TABLE with backtick identifiers", () => {
      const out = buildDropTable(mysqlEm, "users");
      expect(out.sql).toBe("DROP TABLE `users`");
      expect(out.params).toEqual([]);
      expect(out.displaySql).toBe(out.sql);
    });
  });

  describe("postgres", () => {
    it("emits DROP TABLE with double-quoted, schema-qualified identifier", () => {
      const out = buildDropTable(pgEm, "public.users");
      expect(out.sql).toBe('DROP TABLE "public"."users"');
      expect(out.params).toEqual([]);
      expect(out.displaySql).toBe(out.sql);
    });

    it("uses the supplied schema (non-public)", () => {
      const out = buildDropTable(pgEm, "analytics.events");
      expect(out.sql).toBe('DROP TABLE "analytics"."events"');
    });

    it("emits an unqualified table when no schema is in target", () => {
      const out = buildDropTable(pgEm, "users");
      expect(out.sql).toBe('DROP TABLE "users"');
    });
  });
});
