import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { DataSource } from "typeorm";
import { doltliteDriver } from "../../connections/doltliteDriver";
import { CommitDiffType } from "../../diffSummaries/diffSummary.enums";
import { SchemaType } from "../../schemas/schema.enums";
import { convertRowDate } from "../../utils";
import * as t from "../types";
import { DoltLiteQueryFactory } from ".";

let tmpDir: string;
let ds: DataSource;
let qf: DoltLiteQueryFactory;

const dbArgs = { databaseName: "testdb", refName: "main" };

async function commitAll(message: string): Promise<void> {
  await ds.query("SELECT dolt_commit('-Am', ?)", [message]);
}

async function commitHashes(): Promise<string[]> {
  const rows: t.RawRows = await ds.query("SELECT commit_hash FROM dolt_log");
  return rows.map(r => r.commit_hash);
}

beforeAll(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "doltlite-qf-test-"));
  const dbFile = path.join(tmpDir, "testdb.db");
  fs.writeFileSync(dbFile, "");
  ds = new DataSource({
    type: "better-sqlite3",
    database: dbFile,
    driver: doltliteDriver,
    fileMustExist: true,
    statementCacheSize: 0,
    synchronize: false,
  });
  await ds.initialize();
  await ds.query(
    "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL)",
  );
  await ds.query("INSERT INTO users VALUES (1, 'alice')");
  await commitAll("add users table");
  qf = new DoltLiteQueryFactory(ds);
});

afterAll(async () => {
  await qf.destroy();
  await ds.destroy();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("DoltLiteQueryFactory against a real doltlite database", () => {
  it("advertises the connection as dolt", () => {
    expect(qf.isDolt).toBe(true);
  });

  it("reports clean and dirty status", async () => {
    expect(await qf.getStatus(dbArgs)).toEqual([]);
    await ds.query("INSERT INTO users VALUES (2, 'bob')");
    const status = await qf.getStatus(dbArgs);
    expect(status).toEqual([
      { table_name: "users", staged: 0, status: "modified" },
    ]);
    await commitAll("add bob");
  });

  it("lists branches and gets a single branch", async () => {
    const branches = await qf.getAllBranches(dbArgs);
    expect(branches.map(b => b.name)).toEqual(["main"]);
    const branch = await qf.getBranch({ ...dbArgs, branchName: "main" });
    expect(branch?.name).toEqual("main");
    expect(branch?.latest_commit_message).toEqual("add bob");
    expect(convertRowDate(branch?.latest_commit_date).getTime()).not.toBeNaN();
  });

  it("creates and deletes a branch", async () => {
    await qf.createNewBranch({
      ...dbArgs,
      branchName: "scratch",
      fromRefName: "main",
    });
    let branches = await qf.getAllBranches(dbArgs);
    expect(branches.map(b => b.name).sort()).toEqual(["main", "scratch"]);
    await qf.callDeleteBranch({ ...dbArgs, branchName: "scratch" });
    branches = await qf.getAllBranches(dbArgs);
    expect(branches.map(b => b.name)).toEqual(["main"]);
  });

  it("returns logs for a ref and maps unknown refs", async () => {
    const logs = await qf.getLogs(dbArgs, 0);
    expect(logs.map(l => l.message)).toEqual([
      "add bob",
      "add users table",
      "Initialize data repository",
    ]);
    expect(convertRowDate(logs[0].date).getTime()).not.toBeNaN();
    expect(logs[0].parents).toEqual(logs[1].commit_hash);
    await expect(qf.getLogs({ ...dbArgs, refName: "nope" }, 0)).rejects.toThrow(
      "no such ref in database",
    );
  });

  it("scopes table reads to a branch via checkout", async () => {
    await qf.createNewBranch({
      ...dbArgs,
      branchName: "feature",
      fromRefName: "main",
    });
    await qf.getSqlSelect({
      ...dbArgs,
      refName: "feature",
      queryString: "CREATE TABLE feature_only (id INTEGER PRIMARY KEY)",
    });
    expect(await qf.getTableNames({ ...dbArgs, refName: "feature" })).toEqual([
      "feature_only",
      "users",
    ]);
    expect(await qf.getTableNames(dbArgs)).toEqual(["users"]);
  });

  it("returns two dot logs", async () => {
    await qf.getSqlSelect({
      ...dbArgs,
      refName: "feature",
      queryString: "INSERT INTO users VALUES (3, 'carol')",
    });
    await ds.query("SELECT dolt_commit('-Am', 'feature work')");
    const logs = await qf.getTwoDotLogs({
      ...dbArgs,
      fromRefName: "feature",
      toRefName: "main",
    });
    expect(logs.map(l => l.message)).toEqual(["feature work"]);
  });

  it("returns diff stat and summary between refs", async () => {
    // dolt_diff_stat only lists tables with row-level changes, so the empty
    // feature_only table is absent.
    const stat = await qf.getDiffStat({
      ...dbArgs,
      fromRefName: "main",
      toRefName: "feature",
    });
    expect(stat.map(s => s.table_name)).toEqual(["users"]);
    const summary = await qf.getDiffSummary({
      ...dbArgs,
      fromRefName: "main",
      toRefName: "feature",
      tableName: "users",
    });
    expect(summary).toEqual([
      {
        from_table_name: "users",
        to_table_name: "users",
        diff_type: "modified",
        data_change: 1,
        schema_change: 0,
      },
    ]);
  });

  it("returns three dot diff stat via merge base emulation", async () => {
    const stat = await qf.getThreeDotDiffStat({
      ...dbArgs,
      fromRefName: "feature",
      toRefName: "main",
    });
    expect(stat.map(s => s.table_name)).toEqual(["users"]);
  });

  it("resolves three dot refs to merge base and head", async () => {
    const { fromCommitId, toCommitId } = await qf.resolveRefs({
      ...dbArgs,
      fromRefName: "feature",
      toRefName: "main",
      type: CommitDiffType.ThreeDot,
    });
    const mergeBase = await qf.getMergeBase({
      ...dbArgs,
      fromRefName: "feature",
      toRefName: "main",
    });
    expect(fromCommitId).toEqual(mergeBase);
    const featureHead = await ds.query("SELECT dolt_hashof('feature') AS h");
    expect(toCommitId).toEqual(featureHead[0].h);
  });

  it("returns schema patch and schema diff", async () => {
    await qf.getSqlSelect({
      ...dbArgs,
      refName: "feature",
      queryString: "ALTER TABLE users ADD COLUMN age INTEGER",
    });
    await ds.query("SELECT dolt_commit('-Am', 'add age column')");
    const patch = await qf.getSchemaPatch({
      ...dbArgs,
      fromRefName: "main",
      toRefName: "feature",
      tableName: "users",
    });
    // SQLite expresses ADD COLUMN as a multi-statement table rebuild.
    expect(patch.length).toBeGreaterThan(0);
    expect(patch.map(p => p.statement).join("\n")).toContain("age");
    const diff = await qf.getSchemaDiff({
      ...dbArgs,
      fromRefName: "main",
      toRefName: "feature",
      tableName: "users",
    });
    expect(diff.length).toEqual(1);
  });

  it("returns working diff rows", async () => {
    await ds.query("SELECT dolt_checkout('main')");
    await ds.query("INSERT INTO users VALUES (4, 'dave')");
    const rows = await qf.getWorkingDiffRows(
      { ...dbArgs, tableName: "users" },
      { pkCols: ["id"], offset: 0 },
    );
    expect(rows.length).toEqual(1);
    expect(rows[0].to_name).toEqual("dave");
    expect(rows[0].diff_type).toEqual("added");
  });

  it("merges table rows with their working diffs", async () => {
    const rows = await ds.query("SELECT * FROM users ORDER BY id");
    const withDiff = await qf.getTableRowsWithDiff(
      { ...dbArgs, tableName: "users" },
      rows,
      { pkCols: ["id"], offset: 0 },
    );
    expect(withDiff.length).toEqual(1);
    expect(withDiff[0].to_id).toEqual(4);
    await commitAll("add dave");
  });

  it("returns row diffs between adjacent commits", async () => {
    const [toCommit, fromCommit] = await commitHashes();
    const { colsUnion, diff } = await qf.getRowDiffs({
      ...dbArgs,
      tableName: "users",
      fromTableName: "users",
      toTableName: "users",
      fromCommitId: fromCommit,
      toCommitId: toCommit,
      offset: 0,
    });
    expect(colsUnion.map(c => c.Field)).toEqual(["id", "name"]);
    expect(colsUnion[0].Key).toEqual("PRI");
    expect(diff.length).toEqual(1);
    expect(diff[0].to_name).toEqual("dave");
  });

  it("returns row diffs between arbitrary branches", async () => {
    const { colsUnion, diff } = await qf.getRowDiffs({
      ...dbArgs,
      tableName: "users",
      fromTableName: "users",
      toTableName: "users",
      fromCommitId: "main",
      toCommitId: "feature",
      offset: 0,
    });
    expect(diff.map(d => d.diff_type).sort()).toEqual(["added", "removed"]);
    // The to side is introspected at its own commit, so feature's age
    // column appears even though main (the current checkout) lacks it.
    expect(colsUnion.map(c => c.Field)).toContain("age");
  });

  it("returns row diffs against the working set using a branch ref", async () => {
    await ds.query("UPDATE users SET name='davey' WHERE id=4");
    const { diff } = await qf.getRowDiffs({
      ...dbArgs,
      tableName: "users",
      fromTableName: "users",
      toTableName: "users",
      fromCommitId: "main",
      toCommitId: "WORKING",
      offset: 0,
    });
    expect(diff.length).toEqual(1);
    expect(diff[0].diff_type).toEqual("modified");

    // The working-diff page requests the STAGED..WORKING range; STAGED must
    // resolve like WORKING and keep pk flags so tables aren't "keyless".
    const staged = await qf.getRowDiffs({
      ...dbArgs,
      tableName: "users",
      fromTableName: "users",
      toTableName: "users",
      fromCommitId: "STAGED",
      toCommitId: "WORKING",
      offset: 0,
    });
    expect(staged.diff.length).toEqual(1);
    expect(staged.colsUnion.find(c => c.Field === "id")?.Key).toEqual("PRI");
    await ds.query("SELECT dolt_reset('--hard')");
  });

  it("returns one sided rows for an added working table", async () => {
    await ds.query("CREATE TABLE added_tbl (a INTEGER PRIMARY KEY, b TEXT)");
    await ds.query("INSERT INTO added_tbl VALUES (1, 'x')");
    // Leave a different branch checked out: the WORKING read must pin the
    // session to branchRefName rather than rely on leftover connection state.
    await ds.query("SELECT dolt_checkout('feature')");
    const { rows, columns } = await qf.getOneSidedRowDiff({
      ...dbArgs,
      tableName: "added_tbl",
      refName: "WORKING",
      branchRefName: "main",
      offset: 0,
    });
    expect(columns.map(c => c.Field)).toEqual(["a", "b"]);
    expect(rows).toEqual([{ a: 1, b: "x" }]);
    await ds.query("SELECT dolt_checkout('main')");
    await ds.query("DROP TABLE added_tbl");
  });

  it("returns one sided rows for a dropped table at a commit", async () => {
    await ds.query("CREATE TABLE dropped_tbl (a INTEGER PRIMARY KEY, b TEXT)");
    await ds.query("INSERT INTO dropped_tbl VALUES (1, 'gone')");
    await commitAll("add dropped_tbl");
    const [withTable] = await commitHashes();
    await ds.query("DROP TABLE dropped_tbl");
    await commitAll("drop dropped_tbl");
    const { rows, columns } = await qf.getOneSidedRowDiff({
      ...dbArgs,
      tableName: "dropped_tbl",
      refName: withTable,
      offset: 0,
    });
    expect(columns.map(c => c.Field)).toEqual(["a", "b"]);
    expect(rows).toEqual([{ a: 1, b: "gone" }]);
  });

  it("returns a commit diff for adjacent commits", async () => {
    const logs: t.RawRows = await ds.query(
      "SELECT commit_hash, message FROM dolt_log",
    );
    const idx = logs.findIndex(l => l.message === "add dave");
    const res = await qf.doltCommitDiff({
      ...dbArgs,
      tableName: "users",
      fromCommitId: logs[idx + 1].commit_hash,
      toCommitId: logs[idx].commit_hash,
    });
    expect(res.rows.length).toEqual(1);
    expect(res.rows[0].to_name).toEqual("dave");
  });

  it("returns a commit diff between arbitrary branches", async () => {
    const res = await qf.doltCommitDiff({
      ...dbArgs,
      tableName: "users",
      fromCommitId: "main",
      toCommitId: "feature",
    });
    expect(res.rows.map(r => r.diff_type).sort()).toEqual(["added", "removed"]);
    expect(res.queryString).toContain("dolt_diff_users");
    // Pagination applies to execution but stays out of the display query.
    expect(res.queryString).not.toContain("LIMIT");
    const pastTheEnd = await qf.doltCommitDiff({
      ...dbArgs,
      tableName: "users",
      fromCommitId: "main",
      toCommitId: "feature",
      offset: 50,
    });
    expect(pastTheEnd.rows).toEqual([]);
  });

  it("returns a three dot commit diff via range specs", async () => {
    const res = await qf.doltCommitDiff({
      ...dbArgs,
      tableName: "users",
      fromCommitId: "feature",
      toCommitId: "main",
      type: CommitDiffType.ThreeDot,
    });
    expect(res.rows.map(r => r.diff_type)).toEqual(["added"]);
    expect(res.queryString).toContain("'main...feature'");
  });

  it("returns cell history for a row", async () => {
    const res = await qf.doltCellHistory({
      ...dbArgs,
      tableName: "users",
      pkValues: [{ column: "id", value: "4" }],
      columnName: "name",
    });
    expect(res.rows.length).toBeGreaterThan(0);
    expect(res.rows[0].name).toEqual("dave");
  });

  it("returns cell diffs for a row", async () => {
    const res = await qf.doltCellDiff({
      ...dbArgs,
      tableName: "users",
      pkValues: [{ column: "id", value: "4" }],
      columnName: "name",
    });
    expect(res.rows.length).toBeGreaterThan(0);
  });

  it("finds cell history for pks beyond Number precision", async () => {
    await ds.query("SELECT dolt_checkout('main')");
    await ds.query("CREATE TABLE big (id INTEGER PRIMARY KEY, v TEXT)");
    await ds.query("INSERT INTO big VALUES (9007199254740993, 'exact')");
    await commitAll("add big pk row");
    const res = await qf.doltCellHistory({
      ...dbArgs,
      tableName: "big",
      pkValues: [{ column: "id", value: "9007199254740993" }],
      columnName: "v",
    });
    expect(res.rows.length).toEqual(1);
    expect(res.rows[0].v).toEqual("exact");
    await ds.query("DROP TABLE big");
    await commitAll("drop big");
  });

  it("finds cell history for exact decimal pks beyond Number precision", async () => {
    await ds.query("SELECT dolt_checkout('main')");
    await ds.query(
      "CREATE TABLE big_decimal (id DECIMAL(20,0) PRIMARY KEY, v TEXT)",
    );
    await ds.query(
      "INSERT INTO big_decimal VALUES (9007199254740993, 'exact')",
    );
    await commitAll("add exact decimal pk row");
    const res = await qf.doltCellHistory({
      ...dbArgs,
      tableName: "big_decimal",
      pkValues: [
        { column: "id", value: "9007199254740993", type: "DECIMAL(20,0)" },
      ],
      columnName: "v",
    });
    expect(res.rows.length).toEqual(1);
    expect(res.rows[0].v).toEqual("exact");
    await ds.query("DROP TABLE big_decimal");
    await commitAll("drop big decimal");
  });

  it("creates, lists, and deletes tags", async () => {
    await qf.createNewTag({
      ...dbArgs,
      tagName: "v1",
      fromRefName: "main",
      message: "first release",
      author: { name: "Eric", email: "eric@dolthub.com" },
    });
    const tags = await qf.getTags(dbArgs);
    expect(tags.map(tag => tag.tag_name)).toEqual(["v1"]);
    expect(tags[0].message).toEqual("first release");
    expect(tags[0].tagger).toEqual("Eric");
    expect(convertRowDate(tags[0].date).getTime()).not.toBeNaN();
    const tag = await qf.getTag({ ...dbArgs, tagName: "v1" });
    expect(tag).toMatchObject({ tag_name: "v1" });
    await qf.callDeleteTag({ ...dbArgs, tagName: "v1" });
    expect(await qf.getTags(dbArgs)).toEqual([]);
  });

  it("merges a branch cleanly", async () => {
    const res = await qf.callMerge({
      ...dbArgs,
      fromBranchName: "feature",
      toBranchName: "main",
      author: { name: "Eric", email: "eric@dolthub.com" },
    });
    expect(res).toBe(true);
    const logs = await qf.getLogs(dbArgs, 0);
    expect(logs[0].message).toEqual("Merge branch feature");
    expect(logs[0].committer).toEqual("Eric");
    expect(logs[0].parents.split(", ").length).toEqual(2);
    // The author config is session-scoped and must not leak past the merge.
    const cfg = await ds.query("SELECT dolt_config('user.name') AS v");
    expect(cfg[0].v).toEqual("doltlite");
  });

  it("surfaces conflicts from callMerge and resolves them via callMergeWithResolveConflicts", async () => {
    await qf.createNewBranch({
      ...dbArgs,
      branchName: "conflicting",
      fromRefName: "main",
    });
    await ds.query("UPDATE users SET name='main-name' WHERE id=1");
    await commitAll("main name");
    await qf.getSqlSelect({
      ...dbArgs,
      refName: "conflicting",
      queryString: "UPDATE users SET name='other-name' WHERE id=1",
    });
    await ds.query("SELECT dolt_commit('-Am', 'conflicting name')");

    const summary = await qf.getPullConflictsSummary({
      ...dbArgs,
      fromBranchName: "conflicting",
      toBranchName: "main",
    });
    expect(summary).toEqual([{ table: "users", num_data_conflicts: 1 }]);

    const conflictRows = await qf.getPullRowConflicts({
      ...dbArgs,
      fromBranchName: "conflicting",
      toBranchName: "main",
      tableName: "users",
      offset: 0,
    });
    expect(conflictRows.length).toEqual(1);
    expect(conflictRows[0].our_name).toEqual("main-name");
    expect(conflictRows[0].their_name).toEqual("other-name");

    // The preview must leave no trace: no leftover branch, data untouched,
    // and a user branch that happens to share the preview prefix survives.
    await ds.query(
      "SELECT dolt_branch('__workbench_merge_preview_mine', 'main')",
    );
    await qf.getPullConflictsSummary({
      ...dbArgs,
      fromBranchName: "conflicting",
      toBranchName: "main",
    });
    const branches = await qf.getAllBranches(dbArgs);
    const previewLike = branches
      .map(b => b.name)
      .filter(n => n.startsWith("__workbench_merge_preview"));
    expect(previewLike).toEqual(["__workbench_merge_preview_mine"]);
    await ds.query(
      "SELECT dolt_branch('-D', '__workbench_merge_preview_mine')",
    );
    const mainRows = await ds.query("SELECT name FROM users WHERE id=1");
    expect(mainRows[0].name).toEqual("main-name");

    await expect(
      qf.callMerge({
        ...dbArgs,
        fromBranchName: "conflicting",
        toBranchName: "main",
      }),
    ).rejects.toThrow(/conflict/);

    const res = await qf.callMergeWithResolveConflicts({
      ...dbArgs,
      fromBranchName: "conflicting",
      toBranchName: "main",
      oursTables: [],
      theirsTables: ["users"],
    });
    expect(res).toBe(true);
    const rows = await ds.query("SELECT name FROM users WHERE id=1");
    expect(rows[0].name).toEqual("other-name");
  });

  it("restores all tables to head", async () => {
    await ds.query("INSERT INTO users (id, name) VALUES (10, 'temp')");
    await ds.query("CREATE TABLE brand_new (id INTEGER PRIMARY KEY)");
    await qf.restoreAllTables(dbArgs);
    expect(await qf.getStatus(dbArgs)).toEqual([]);
    const rows = await ds.query("SELECT * FROM users WHERE id=10");
    expect(rows).toEqual([]);
  });

  it("lists, saves, updates, and deletes docs", async () => {
    const initialDocs = await qf.getDocs(dbArgs);
    expect(initialDocs?.map(d => d.doc_name)).toEqual(["AGENT.md"]);

    const saved = await qf.saveDoc({
      ...dbArgs,
      docName: "README.md",
      markdown: "# hello",
    });
    expect(saved.rowsAffected).toEqual(1);
    expect(saved.queryString).toContain('INSERT OR REPLACE INTO "dolt_docs"');
    let docs = await qf.getDocs(dbArgs);
    expect(docs?.map(d => d.doc_name)).toEqual(["README.md", "AGENT.md"]);
    expect(docs?.find(d => d.doc_name === "README.md")?.doc_text).toEqual(
      "# hello",
    );
    expect(await qf.getTableNames(dbArgs, true)).not.toContain("dolt_docs");
    expect(await qf.getTableNames(dbArgs)).toContain("dolt_docs");

    await qf.saveDoc({
      ...dbArgs,
      docName: "README.md",
      markdown: "# updated",
    });
    docs = await qf.getDocs(dbArgs);
    expect(docs?.find(d => d.doc_name === "README.md")?.doc_text).toEqual(
      "# updated",
    );

    const deleted = await qf.deleteDoc({
      ...dbArgs,
      docName: "README.md",
    });
    expect(deleted.rowsAffected).toEqual(1);
    expect((await qf.getDocs(dbArgs))?.map(d => d.doc_name)).toEqual([
      "AGENT.md",
    ]);
    await qf.restoreAllTables(dbArgs);
  });

  it("calls dolt procedures through the SELECT verb", async () => {
    const res = await qf.callProcedure({
      ...dbArgs,
      name: "dolt_reset",
      args: ["--hard"],
    });
    expect(res.queryString).toEqual(`SELECT dolt_reset('--hard')`);
  });

  it("returns schema items scoped to a branch", async () => {
    await qf.getSqlSelect({
      ...dbArgs,
      refName: "feature",
      queryString: "CREATE VIEW feature_view AS SELECT name FROM users",
    });
    const schemas = await qf.getSchemas({ ...dbArgs, refName: "feature" });
    expect(schemas).toEqual([{ name: "feature_view", type: SchemaType.View }]);
    expect(await qf.getSchemas(dbArgs)).toEqual([]);
  });

  it("reads tables at a tag through a detached session", async () => {
    await ds.query("SELECT dolt_tag('detached-tag', 'main')");
    await ds.query("INSERT INTO users (id, name) VALUES (20, 'after-tag')");
    await commitAll("after tag");

    const tables = await qf.getTableNames({
      ...dbArgs,
      refName: "detached-tag",
    });
    expect(tables).toContain("users");

    const res = await qf.getSqlSelect({
      ...dbArgs,
      refName: "detached-tag",
      queryString: "SELECT * FROM users WHERE id = 20",
    });
    expect(res.rows).toEqual([]);
    const onMain = await qf.getSqlSelect({
      ...dbArgs,
      queryString: "SELECT id FROM users WHERE id = 20",
    });
    expect(onMain.rows).toEqual([{ id: 20 }]);
  });

  it("reads tables at a commit hash through a detached session", async () => {
    const [head, parent] = await commitHashes();
    const atParent = await qf.getSqlSelect({
      ...dbArgs,
      refName: parent,
      queryString: "SELECT id FROM users WHERE id = 20",
    });
    expect(atParent.rows).toEqual([]);
    const atHead = await qf.getSqlSelect({
      ...dbArgs,
      refName: head,
      queryString: "SELECT id FROM users WHERE id = 20",
    });
    expect(atHead.rows).toEqual([{ id: 20 }]);
    const info = await qf.getTableInfo({
      ...dbArgs,
      refName: parent,
      tableName: "users",
    });
    expect(info?.columns.map(c => c.name)).toContain("id");
  });

  it("rejects writes in a detached session", async () => {
    await expect(
      qf.getSqlSelect({
        ...dbArgs,
        refName: "detached-tag",
        queryString: "INSERT INTO users (id, name) VALUES (99, 'nope')",
      }),
    ).rejects.toThrow(/readonly/);
    await ds.query("SELECT dolt_tag('-d', 'detached-tag')");
  });

  it("reopens a detached session when a tag moves", async () => {
    await ds.query("SELECT dolt_tag('moving-tag', 'main')");
    const before = await qf.getSqlSelect({
      ...dbArgs,
      refName: "moving-tag",
      queryString: "SELECT id FROM users WHERE id = 21",
    });
    expect(before.rows).toEqual([]);

    await ds.query(
      "INSERT INTO users (id, name) VALUES (21, 'after-moving-tag')",
    );
    await commitAll("move tag target");
    await ds.query("SELECT dolt_tag('-d', 'moving-tag')");
    await ds.query("SELECT dolt_tag('moving-tag', 'main')");

    const after = await qf.getSqlSelect({
      ...dbArgs,
      refName: "moving-tag",
      queryString: "SELECT id FROM users WHERE id = 21",
    });
    expect(after.rows).toEqual([{ id: 21 }]);
    await ds.query("SELECT dolt_tag('-d', 'moving-tag')");
  });

  it("keeps a detached source alive while another revision replaces it", async () => {
    await ds.query("SELECT dolt_tag('race-tag', 'main')");
    const head = await ds.query("SELECT dolt_hashof('main') AS h");
    const result = await qf.queryMultiple(
      async query => {
        const first = await query("SELECT id FROM users ORDER BY id");
        // Requesting a different revision mid-unit retires race-tag's
        // source; it must survive until this unit finishes.
        await qf.getTableNames({ ...dbArgs, refName: head[0].h });
        const second = await query("SELECT id FROM users ORDER BY id");
        return { first, second };
      },
      dbArgs.databaseName,
      "race-tag",
    );
    expect(result.second).toEqual(result.first);
    await ds.query("SELECT dolt_tag('-d', 'race-tag')");
  });

  it("still maps unknown refs to a clear error", async () => {
    await expect(
      qf.getTableNames({ ...dbArgs, refName: "not-a-ref" }),
    ).rejects.toThrow();
  });

  it("saves, lists, and runs tests", async () => {
    expect(await qf.getTests(dbArgs)).toEqual([]);
    const saved = await qf.saveTests({
      ...dbArgs,
      tests: {
        list: [
          {
            testName: "count's rows",
            testGroup: "basic",
            testQuery: "SELECT * FROM users WHERE id = 1",
            assertionType: "expected_rows",
            assertionComparator: "==",
            assertionValue: "1",
          },
          {
            testName: "single value",
            testGroup: "basic",
            testQuery: "SELECT count(*) FROM users",
            assertionType: "expected_single_value",
            assertionComparator: ">=",
            assertionValue: "1",
          },
        ],
      },
    });
    expect(saved.generatedMaps.map(t => t.test_name)).toEqual([
      "count's rows",
      "single value",
    ]);
    expect((await qf.getTests(dbArgs)).map(t => t.test_name)).toEqual([
      "count's rows",
      "single value",
    ]);
    expect(await qf.getTableNames(dbArgs, true)).not.toContain("dolt_tests");
    expect(await qf.getTableNames(dbArgs)).toContain("dolt_tests");

    const all = await qf.runTests(dbArgs);
    expect(all.map(t => t.status)).toEqual(["PASS", "PASS"]);
    const byName = await qf.runTests({
      ...dbArgs,
      testIdentifier: { testName: "count's rows" },
    });
    expect(byName).toEqual([
      {
        test_name: "count's rows",
        test_group_name: "basic",
        query: "SELECT * FROM users WHERE id = 1",
        status: "PASS",
        message: "",
      },
    ]);
    const byGroup = await qf.runTests({
      ...dbArgs,
      testIdentifier: { groupName: "basic" },
    });
    expect(byGroup.map(t => t.test_name)).toEqual([
      "count's rows",
      "single value",
    ]);
    const cleared = await qf.saveTests({
      ...dbArgs,
      tests: { list: [] },
    });
    expect(cleared.generatedMaps).toEqual([]);
    expect(await qf.getTests(dbArgs)).toEqual([]);
    await qf.restoreAllTables(dbArgs);
  });

  it("returns remote branches from dolt_remote_branches", async () => {
    // Tracking refs require clone/fetch, which this build lacks; this covers
    // the query path and empty-list shape.
    expect(
      await qf.getRemoteBranches({
        ...dbArgs,
        remoteName: "origin",
        offset: 0,
      }),
    ).toEqual([]);
  });

  it("wires clone to the engine, which requires an empty database", async () => {
    await expect(
      qf.callDoltClone({ ...dbArgs, remoteDbPath: "org/db" }),
    ).rejects.toThrow(/fresh database/);
  });

  it("pushes, fetches, pulls, and lists remote branches over a file remote", async () => {
    const remoteUrl = `file://${path.join(tmpDir, "file-remote")}`;
    await qf.addRemote({ ...dbArgs, remoteName: "origin", remoteUrl });
    const remotes = await qf.getRemotes({ ...dbArgs, offset: 0 });
    expect(remotes.map(r => r.name)).toEqual(["origin"]);

    const push = await qf.callPushRemote({
      ...dbArgs,
      remoteName: "origin",
      branchName: "main",
    });
    expect(push).toEqual([{ status: "0", message: "" }]);

    await qf.createNewBranch({
      ...dbArgs,
      branchName: "publish-source",
      fromRefName: "main",
    });
    await qf.getSqlSelect({
      ...dbArgs,
      refName: "publish-source",
      queryString:
        "INSERT INTO users (id, name) VALUES (30, 'remote branch row')",
    });
    await commitAll("add remote branch row");
    await ds.query("SELECT dolt_checkout('main')");
    await qf.callPushRemote({
      ...dbArgs,
      remoteName: "origin",
      branchName: "publish-source",
    });

    const fetch = await qf.callFetchRemote({ ...dbArgs, remoteName: "origin" });
    expect(fetch).toEqual([{ status: "0" }]);

    const remoteBranches = await qf.getRemoteBranches({
      ...dbArgs,
      remoteName: "origin",
      offset: 0,
    });
    expect(remoteBranches.map(b => b.name).sort()).toEqual([
      "remotes/origin/main",
      "remotes/origin/publish-source",
    ]);
    expect(
      convertRowDate(remoteBranches[0].latest_commit_date).getTime(),
    ).not.toBeNaN();

    await qf.callDeleteBranch({ ...dbArgs, branchName: "publish-source" });
    const createBranch = await qf.callCreateBranchFromRemote({
      ...dbArgs,
      remoteName: "origin",
      branchName: "publish-source",
    });
    expect(createBranch).toEqual([{ status: "0" }]);
    expect((await qf.getAllBranches(dbArgs)).map(b => b.name)).toContain(
      "publish-source",
    );

    const pull = await qf.callPullRemote({
      ...dbArgs,
      remoteName: "origin",
      branchName: "main",
      refName: "main",
    });
    expect(pull).toEqual([{ fast_forward: "0", conflicts: "0", message: "" }]);

    await qf.callDeleteBranch({ ...dbArgs, branchName: "publish-source" });
    await qf.callDeleteRemote({ ...dbArgs, remoteName: "origin" });
    expect(await qf.getRemotes({ ...dbArgs, offset: 0 })).toEqual([]);
  });

  it("clones a file remote into an empty database", async () => {
    const cloneFile = path.join(tmpDir, "clone-target.db");
    fs.writeFileSync(cloneFile, "");
    const cloneDs = new DataSource({
      type: "better-sqlite3",
      database: cloneFile,
      driver: doltliteDriver,
      fileMustExist: true,
      statementCacheSize: 0,
      synchronize: false,
    });
    await cloneDs.initialize();
    const cloneQf = new DoltLiteQueryFactory(cloneDs);
    try {
      await cloneQf.callDoltClone({
        databaseName: "clone-target",
        remoteDbPath: `file://${path.join(tmpDir, "file-remote")}`,
      });
      expect(await cloneQf.getTableNames({ ...dbArgs })).toContain("users");
      const remoteBranches = await cloneQf.getRemoteBranches({
        ...dbArgs,
        remoteName: "origin",
        offset: 0,
      });
      expect(remoteBranches.map(b => b.name).sort()).toEqual([
        "remotes/origin/main",
        "remotes/origin/publish-source",
      ]);
    } finally {
      await cloneQf.destroy();
      await cloneDs.destroy();
    }
  });
});
