import { DataSource, EntityManager } from "typeorm";
import { buildDropColumn } from "./buildDropColumn";

const mysqlEm = new EntityManager(
  new DataSource({ type: "mysql", host: "", database: "" }),
);
const pgEm = new EntityManager(
  new DataSource({ type: "postgres", host: "", database: "" }),
);

describe("buildDropColumn", () => {
  describe("mysql", () => {
    it("emits ALTER TABLE ... DROP COLUMN with backtick identifiers", () => {
      const out = buildDropColumn(mysqlEm, "users", "email");
      expect(out.sql).toBe("ALTER TABLE `users` DROP COLUMN `email`");
      expect(out.params).toEqual([]);
      expect(out.displaySql).toBe(out.sql);
    });
  });

  describe("postgres", () => {
    it("emits ALTER TABLE ... DROP COLUMN with double-quoted identifiers", () => {
      const out = buildDropColumn(pgEm, "public.users", "email");
      expect(out.sql).toBe('ALTER TABLE "public"."users" DROP COLUMN "email"');
      expect(out.params).toEqual([]);
      expect(out.displaySql).toBe(out.sql);
    });

    it("uses the supplied schema (non-public)", () => {
      const out = buildDropColumn(pgEm, "analytics.events", "ts");
      expect(out.sql).toBe('ALTER TABLE "analytics"."events" DROP COLUMN "ts"');
    });

    it("emits an unqualified table when no schema is in target", () => {
      const out = buildDropColumn(pgEm, "users", "email");
      expect(out.sql).toBe('ALTER TABLE "users" DROP COLUMN "email"');
    });
  });
});
