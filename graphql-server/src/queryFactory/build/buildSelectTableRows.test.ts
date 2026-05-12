import { DataSource, EntityManager } from "typeorm";
import { buildSelectTableRows } from "./buildSelectTableRows";

const mysqlEm = new EntityManager(
  new DataSource({ type: "mysql", host: "", database: "" }),
);
const pgEm = new EntityManager(
  new DataSource({ type: "postgres", host: "", database: "" }),
);

describe("buildSelectTableRows", () => {
  describe("mysql", () => {
    it("emits SELECT * with limit when no other args", () => {
      const out = buildSelectTableRows(mysqlEm, "users", { limit: 51 });
      expect(out.sql).toBe("SELECT * FROM `users` LIMIT 51");
      expect(out.params).toEqual([]);
      expect(out.displaySql).toBe("SELECT * FROM `users`");
    });

    it("emits SELECT with explicit projection when provided", () => {
      const out = buildSelectTableRows(mysqlEm, "users", {
        projection: ["id", "name"],
        limit: 51,
      });
      expect(out.sql).toBe("SELECT `id`, `name` FROM `users` LIMIT 51");
    });

    it("emits SELECT * when projection is empty", () => {
      const out = buildSelectTableRows(mysqlEm, "users", {
        projection: [],
        limit: 51,
      });
      expect(out.sql).toBe("SELECT * FROM `users` LIMIT 51");
    });

    it("emits ORDER BY for a single column (ASC)", () => {
      const out = buildSelectTableRows(mysqlEm, "users", {
        orderBy: [{ column: "name", direction: "ASC" }],
        limit: 51,
      });
      expect(out.sql).toBe(
        "SELECT * FROM `users` ORDER BY `name` ASC LIMIT 51",
      );
    });

    it("emits stacked ORDER BY (primary first, then secondary)", () => {
      const out = buildSelectTableRows(mysqlEm, "users", {
        orderBy: [
          { column: "tenant_id", direction: "ASC" },
          { column: "created_at", direction: "DESC" },
        ],
        limit: 51,
      });
      expect(out.sql).toBe(
        "SELECT * FROM `users` ORDER BY `tenant_id` ASC, `created_at` DESC LIMIT 51",
      );
    });

    it("emits WHERE clauses ANDed with parameters", () => {
      const out = buildSelectTableRows(mysqlEm, "users", {
        where: [
          { column: "active", value: "true", type: "boolean" },
          { column: "tenant_id", value: "5", type: "int" },
        ],
        limit: 51,
      });
      expect(out.sql).toBe(
        "SELECT * FROM `users` WHERE `active` = ? AND `tenant_id` = ? LIMIT 51",
      );
      expect(out.params).toEqual(["true", "5"]);
      expect(out.displaySql).toBe(
        "SELECT * FROM `users` WHERE `active` = TRUE AND `tenant_id` = 5",
      );
    });

    it("excludePks emits NOT (...) per row", () => {
      const out = buildSelectTableRows(mysqlEm, "users", {
        excludePks: [
          { values: [{ column: "id", value: "1", type: "int" }] },
          { values: [{ column: "id", value: "2", type: "int" }] },
        ],
        limit: 51,
      });
      expect(out.sql).toBe(
        "SELECT * FROM `users` WHERE NOT (`id` = ?) AND NOT (`id` = ?) LIMIT 51",
      );
      expect(out.params).toEqual(["1", "2"]);
    });

    it("excludePks with composite PK ANDs the columns inside NOT(...)", () => {
      const out = buildSelectTableRows(mysqlEm, "users", {
        excludePks: [
          {
            values: [
              { column: "tenant_id", value: "5", type: "int" },
              { column: "id", value: "1", type: "int" },
            ],
          },
        ],
        limit: 51,
      });
      expect(out.sql).toBe(
        "SELECT * FROM `users` WHERE NOT (`tenant_id` = ? AND `id` = ?) LIMIT 51",
      );
      expect(out.params).toEqual(["5", "1"]);
    });

    it("combines where + excludePks correctly", () => {
      const out = buildSelectTableRows(mysqlEm, "users", {
        where: [{ column: "active", value: "true", type: "boolean" }],
        excludePks: [{ values: [{ column: "id", value: "7", type: "int" }] }],
        limit: 51,
      });
      expect(out.sql).toBe(
        "SELECT * FROM `users` WHERE `active` = ? AND NOT (`id` = ?) LIMIT 51",
      );
      expect(out.params).toEqual(["true", "7"]);
    });

    it("emits LIMIT + OFFSET when offset is provided", () => {
      const out = buildSelectTableRows(mysqlEm, "users", {
        offset: 100,
        limit: 51,
      });
      expect(out.sql).toBe("SELECT * FROM `users` LIMIT 51 OFFSET 100");
    });

    it("omits OFFSET when offset is 0", () => {
      const out = buildSelectTableRows(mysqlEm, "users", {
        offset: 0,
        limit: 51,
      });
      expect(out.sql).toBe("SELECT * FROM `users` LIMIT 51");
    });

    it("kitchen sink: projection + where + excludePks + multi-orderBy + offset", () => {
      const out = buildSelectTableRows(mysqlEm, "users", {
        projection: ["id", "name"],
        where: [{ column: "active", value: "true", type: "boolean" }],
        excludePks: [{ values: [{ column: "id", value: "3", type: "int" }] }],
        orderBy: [
          { column: "name", direction: "ASC" },
          { column: "id", direction: "DESC" },
        ],
        offset: 50,
        limit: 51,
      });
      expect(out.sql).toBe(
        "SELECT `id`, `name` FROM `users` WHERE `active` = ? AND NOT (`id` = ?) ORDER BY `name` ASC, `id` DESC LIMIT 51 OFFSET 50",
      );
      expect(out.params).toEqual(["true", "3"]);
    });
  });

  describe("postgres", () => {
    it("emits SELECT * with $-placeholders and schema-qualified target", () => {
      const out = buildSelectTableRows(pgEm, "public.users", {
        where: [{ column: "id", value: "1", type: "int" }],
        limit: 51,
      });
      expect(out.sql).toBe(
        'SELECT * FROM "public"."users" WHERE "id" = $1 LIMIT 51',
      );
      expect(out.params).toEqual(["1"]);
      expect(out.displaySql).toBe(
        `SELECT * FROM "public"."users" WHERE "id" = 1`,
      );
    });

    it("emits non-public schema and column projection", () => {
      const out = buildSelectTableRows(pgEm, "analytics.events", {
        projection: ["ts", "event"],
        limit: 51,
      });
      expect(out.sql).toBe(
        'SELECT "ts", "event" FROM "analytics"."events" LIMIT 51',
      );
    });

    it("emits stacked ORDER BY", () => {
      const out = buildSelectTableRows(pgEm, "public.users", {
        orderBy: [
          { column: "tenant_id", direction: "ASC" },
          { column: "name", direction: "DESC" },
        ],
        limit: 51,
      });
      expect(out.sql).toBe(
        'SELECT * FROM "public"."users" ORDER BY "tenant_id" ASC, "name" DESC LIMIT 51',
      );
    });

    it("excludePks emits NOT (...) AND-joined", () => {
      const out = buildSelectTableRows(pgEm, "public.users", {
        excludePks: [
          { values: [{ column: "id", value: "1", type: "int" }] },
          { values: [{ column: "id", value: "2", type: "int" }] },
        ],
        limit: 51,
      });
      expect(out.sql).toBe(
        'SELECT * FROM "public"."users" WHERE NOT ("id" = $1) AND NOT ("id" = $2) LIMIT 51',
      );
      expect(out.params).toEqual(["1", "2"]);
    });

    it("emits OFFSET when provided", () => {
      const out = buildSelectTableRows(pgEm, "public.users", {
        offset: 100,
        limit: 51,
      });
      expect(out.sql).toBe(
        'SELECT * FROM "public"."users" LIMIT 51 OFFSET 100',
      );
    });

    it("kitchen sink in postgres", () => {
      const out = buildSelectTableRows(pgEm, "public.users", {
        projection: ["id", "name"],
        where: [{ column: "active", value: "true", type: "boolean" }],
        excludePks: [{ values: [{ column: "id", value: "3", type: "int" }] }],
        orderBy: [{ column: "name", direction: "ASC" }],
        offset: 50,
        limit: 51,
      });
      expect(out.sql).toBe(
        'SELECT "id", "name" FROM "public"."users" WHERE "active" = $1 AND NOT ("id" = $2) ORDER BY "name" ASC LIMIT 51 OFFSET 50',
      );
      expect(out.params).toEqual(["true", "3"]);
      expect(out.displaySql).toBe(
        `SELECT "id", "name" FROM "public"."users" WHERE "active" = TRUE AND NOT ("id" = 3) ORDER BY "name" ASC`,
      );
    });
  });
});
