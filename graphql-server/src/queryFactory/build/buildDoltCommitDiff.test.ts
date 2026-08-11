import { DataSource, EntityManager } from "typeorm";
import { CommitDiffType } from "../../diffSummaries/diffSummary.enums";
import { buildDoltCommitDiff } from "./buildDoltCommitDiff";

const mysqlEm = new EntityManager(
  new DataSource({ type: "mysql", host: "", database: "" }),
);
const pgEm = new EntityManager(
  new DataSource({ type: "postgres", host: "", database: "" }),
);

describe("buildDoltCommitDiff", () => {
  it("emits 2-dot diff with from/to commit conditions (mysql)", () => {
    const out = buildDoltCommitDiff(mysqlEm, "dolt_commit_diff_users", {
      fromCommitId: "abc",
      toCommitId: "def",
      columnNames: ["id", "name"],
    });
    expect(out.sql).toBe(
      "SELECT `diff_type`, `from_id`, `to_id`, `from_name`, `to_name`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_commit_diff_users` WHERE `from_commit` = ? AND `to_commit` = ?",
    );
    expect(out.params).toEqual(["abc", "def"]);
    expect(out.displaySql).toBe(
      "SELECT `diff_type`, `from_id`, `to_id`, `from_name`, `to_name`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_commit_diff_users` WHERE `from_commit` = 'abc' AND `to_commit` = 'def'",
    );
  });

  it("emits 3-dot diff with DOLT_MERGE_BASE/HASHOF (mysql)", () => {
    const out = buildDoltCommitDiff(mysqlEm, "dolt_commit_diff_users", {
      fromCommitId: "branch_a",
      toCommitId: "branch_b",
      columnNames: ["id"],
      type: CommitDiffType.ThreeDot,
    });
    expect(out.sql).toBe(
      "SELECT `diff_type`, `from_id`, `to_id`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_commit_diff_users` WHERE `from_commit` = DOLT_MERGE_BASE(?, ?) AND `to_commit` = HASHOF(?)",
    );
    expect(out.displaySql).toBe(
      "SELECT `diff_type`, `from_id`, `to_id`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_commit_diff_users` WHERE `from_commit` = DOLT_MERGE_BASE('branch_b', 'branch_a') AND `to_commit` = HASHOF('branch_a')",
    );
  });

  it("applies limit and offset without changing displaySql (mysql)", () => {
    const out = buildDoltCommitDiff(
      mysqlEm,
      "dolt_commit_diff_users",
      {
        fromCommitId: "abc",
        toCommitId: "def",
        columnNames: ["id"],
      },
      { limit: 51, offset: 50 },
    );
    expect(out.sql).toBe(
      "SELECT `diff_type`, `from_id`, `to_id`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_commit_diff_users` WHERE `from_commit` = ? AND `to_commit` = ? LIMIT 51 OFFSET 50",
    );
    expect(out.displaySql).toBe(
      "SELECT `diff_type`, `from_id`, `to_id`, `from_commit`, `from_commit_date`, `to_commit`, `to_commit_date` FROM `dolt_commit_diff_users` WHERE `from_commit` = 'abc' AND `to_commit` = 'def'",
    );
  });

  it("emits 2-dot diff with schema-qualified target (postgres)", () => {
    const out = buildDoltCommitDiff(pgEm, "public.dolt_commit_diff_users", {
      fromCommitId: "abc",
      toCommitId: "def",
      columnNames: ["id"],
    });
    expect(out.sql).toBe(
      'SELECT "diff_type", "from_id", "to_id", "from_commit", "from_commit_date", "to_commit", "to_commit_date" FROM "public"."dolt_commit_diff_users" WHERE "from_commit" = $1 AND "to_commit" = $2',
    );
    expect(out.params).toEqual(["abc", "def"]);
  });

  it("emits 3-dot diff with DOLT_MERGE_BASE/HASHOF (postgres)", () => {
    const out = buildDoltCommitDiff(pgEm, "public.dolt_commit_diff_users", {
      fromCommitId: "branch_a",
      toCommitId: "branch_b",
      columnNames: ["id"],
      type: CommitDiffType.ThreeDot,
    });
    expect(out.sql).toBe(
      'SELECT "diff_type", "from_id", "to_id", "from_commit", "from_commit_date", "to_commit", "to_commit_date" FROM "public"."dolt_commit_diff_users" WHERE "from_commit" = DOLT_MERGE_BASE($1, $2) AND "to_commit" = HASHOF($2)',
    );
    expect(out.params).toEqual(["branch_b", "branch_a"]);
    expect(out.displaySql).toBe(
      'SELECT "diff_type", "from_id", "to_id", "from_commit", "from_commit_date", "to_commit", "to_commit_date" FROM "public"."dolt_commit_diff_users" WHERE "from_commit" = DOLT_MERGE_BASE(\'branch_b\', \'branch_a\') AND "to_commit" = HASHOF(\'branch_a\')',
    );
  });
});
