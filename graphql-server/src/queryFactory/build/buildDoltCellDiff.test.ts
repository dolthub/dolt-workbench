import { DataSource, EntityManager } from "typeorm";
import { buildDoltCellDiff } from "./buildDoltCellDiff";

const mysqlEm = new EntityManager(
  new DataSource({ type: "mysql", host: "", database: "" }),
);
const pgEm = new EntityManager(
  new DataSource({ type: "postgres", host: "", database: "" }),
);

describe("buildDoltCellDiff", () => {
  it("emits row history (PK clicked) — all columns, no cell-not-equal", () => {
    const out = buildDoltCellDiff(mysqlEm, "dolt_diff_users", {
      pkValues: [{ column: "id", value: "5", type: "int" }],
      columnNames: ["id", "name"],
    });
    expect(out.sql).toBe(
      "SELECT `diff_type`, `from_id`, `to_id`, `from_name`, `to_name`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_diff_users` WHERE (`to_id` = ?) OR (`from_id` = ?) ORDER BY `to_commit_date` DESC",
    );
    expect(out.params).toEqual(["5", "5"]);
    expect(out.displaySql).toBe(
      "SELECT `diff_type`, `from_id`, `to_id`, `from_name`, `to_name`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_diff_users` WHERE (`to_id` = 5) OR (`from_id` = 5) ORDER BY `to_commit_date` DESC",
    );
  });

  it("emits cell history (non-PK clicked) — single column + cell-not-equal", () => {
    const out = buildDoltCellDiff(mysqlEm, "dolt_diff_users", {
      pkValues: [{ column: "id", value: "5", type: "int" }],
      columnNames: ["id", "name", "email"],
      columnName: "name",
    });
    expect(out.sql).toBe(
      "SELECT `diff_type`, `from_name`, `to_name`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_diff_users` WHERE ((`to_id` = ?) OR (`from_id` = ?)) AND (`from_name` <> `to_name` OR (`from_name` IS NULL AND `to_name` IS NOT NULL) OR (`from_name` IS NOT NULL AND `to_name` IS NULL)) ORDER BY `to_commit_date` DESC",
    );
    expect(out.params).toEqual(["5", "5"]);
  });

  it("composite PK row history (mysql)", () => {
    const out = buildDoltCellDiff(mysqlEm, "dolt_diff_orders", {
      pkValues: [
        { column: "tenant_id", value: "1", type: "int" },
        { column: "order_id", value: "42", type: "int" },
      ],
      columnNames: ["tenant_id", "order_id", "status"],
    });
    expect(out.sql).toBe(
      "SELECT `diff_type`, `from_tenant_id`, `to_tenant_id`, `from_order_id`, `to_order_id`, `from_status`, `to_status`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_diff_orders` WHERE (`to_tenant_id` = ? AND `to_order_id` = ?) OR (`from_tenant_id` = ? AND `from_order_id` = ?) ORDER BY `to_commit_date` DESC",
    );
    expect(out.params).toEqual(["1", "42", "1", "42"]);
  });

  it("escapes single quotes in string PK values for displaySql", () => {
    const out = buildDoltCellDiff(mysqlEm, "dolt_diff_users", {
      pkValues: [{ column: "name", value: "O'Hara", type: "varchar" }],
      columnNames: ["name", "city"],
    });
    expect(out.params).toEqual(["O'Hara", "O'Hara"]);
    expect(out.displaySql).toBe(
      "SELECT `diff_type`, `from_name`, `to_name`, `from_city`, `to_city`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_diff_users` WHERE (`to_name` = 'O''Hara') OR (`from_name` = 'O''Hara') ORDER BY `to_commit_date` DESC",
    );
  });

  it("emits postgres-flavored cell history", () => {
    const out = buildDoltCellDiff(pgEm, "public.dolt_diff_users", {
      pkValues: [{ column: "id", value: "5", type: "int" }],
      columnNames: ["id", "name"],
      columnName: "name",
    });
    expect(out.sql).toBe(
      'SELECT "diff_type", "from_name", "to_name", "from_commit", "from_commit_date", "to_commit", "to_commit_date" FROM "public"."dolt_diff_users" WHERE (("to_id" = $1) OR ("from_id" = $2)) AND ("from_name" <> "to_name" OR ("from_name" IS NULL AND "to_name" IS NOT NULL) OR ("from_name" IS NOT NULL AND "to_name" IS NULL)) ORDER BY "to_commit_date" DESC',
    );
    expect(out.params).toEqual(["5", "5"]);
  });
});
