import { DataSource, EntityManager } from "typeorm";
import { buildDoltCellHistory } from "./buildDoltCellHistory";

const mysqlEm = new EntityManager(
  new DataSource({ type: "mysql", host: "", database: "" }),
);
const pgEm = new EntityManager(
  new DataSource({ type: "postgres", host: "", database: "" }),
);

describe("buildDoltCellHistory", () => {
  it("emits row history with all columns (mysql)", () => {
    const out = buildDoltCellHistory(mysqlEm, "dolt_history_users", {
      pkValues: [{ column: "id", value: "5", type: "int" }],
      columnNames: ["id", "name"],
    });
    expect(out.sql).toBe(
      "SELECT `id`, `name`, `commit_hash`, `committer`, `commit_date` FROM `dolt_history_users` WHERE `id` = ? ORDER BY `commit_date` DESC",
    );
    expect(out.params).toEqual(["5"]);
    expect(out.displaySql).toBe(
      "SELECT `id`, `name`, `commit_hash`, `committer`, `commit_date` FROM `dolt_history_users` WHERE `id` = 5 ORDER BY `commit_date` DESC",
    );
  });

  it("emits cell history with single column (mysql)", () => {
    const out = buildDoltCellHistory(mysqlEm, "dolt_history_users", {
      pkValues: [{ column: "id", value: "5", type: "int" }],
      columnNames: ["id", "name", "email"],
      columnName: "name",
    });
    expect(out.sql).toBe(
      "SELECT `name`, `commit_hash`, `committer`, `commit_date` FROM `dolt_history_users` WHERE `id` = ? ORDER BY `commit_date` DESC",
    );
  });

  it("emits composite PK (mysql)", () => {
    const out = buildDoltCellHistory(mysqlEm, "dolt_history_orders", {
      pkValues: [
        { column: "tenant_id", value: "1", type: "int" },
        { column: "order_id", value: "42", type: "int" },
      ],
      columnNames: ["tenant_id", "order_id", "status"],
    });
    expect(out.sql).toBe(
      "SELECT `tenant_id`, `order_id`, `status`, `commit_hash`, `committer`, `commit_date` FROM `dolt_history_orders` WHERE `tenant_id` = ? AND `order_id` = ? ORDER BY `commit_date` DESC",
    );
    expect(out.params).toEqual(["1", "42"]);
  });

  it("emits postgres-flavored row history", () => {
    const out = buildDoltCellHistory(pgEm, "public.dolt_history_users", {
      pkValues: [{ column: "id", value: "5", type: "int" }],
      columnNames: ["id", "name"],
    });
    expect(out.sql).toBe(
      'SELECT "id", "name", "commit_hash", "committer", "commit_date" FROM "public"."dolt_history_users" WHERE "id" = $1 ORDER BY "commit_date" DESC',
    );
  });
});
