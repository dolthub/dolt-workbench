import { Maybe, Route } from "@dolthub/web-utils";
import * as ps from "./params";

const ENCODE = true;
export type DatabaseUrl = (p: ps.DatabaseParams) => Route;
export type RefUrl = (p: ps.RefOptionalSchemaParams) => Route;

export const databases = new Route("/database");

export const connections = new Route("/connections");

export const newConnection = connections.addStatic("new");

export const database = (p: ps.DatabaseOptionalSchemaParams): Route =>
  databases
    .addDynamic("databaseName", p.databaseName)
    .withQuery({ schemaName: p.schemaName });

export const maybeDatabase = (
  databaseName?: Maybe<string>,
  schemaName?: string,
): Route => (databaseName ? database({ databaseName, schemaName }) : databases);

export const query = (p: ps.RefParams): Route =>
  database(p).addStatic("query").addDynamic("refName", p.refName, ENCODE);

export const sqlQuery = (p: ps.SqlQueryParams): Route =>
  query(p).withQuery({ q: p.q, active: p.active, schemaName: p.schemaName });

export const ref = (p: ps.RefOptionalSchemaParams): Route =>
  database(p)
    .addStatic("data")
    .addDynamic("refName", p.refName, ENCODE)
    .withQuery({ schemaName: p.schemaName });

export const table = (p: ps.TableOptionalSchemaParams): Route =>
  ref(p).addDynamic(
    "tableName",
    p.schemaName ? `${p.schemaName}.${p.tableName}` : p.tableName,
  );

export const editTable = (p: ps.TableParams): Route =>
  table(p).withQuery({ edit: "true" });

export const schemaDiagram = (
  p: ps.RefOptionalSchemaParams & { active?: string },
): Route =>
  database(p)
    .addStatic("schema")
    .addDynamic("refName", p.refName, ENCODE)
    .withQuery({ active: p.active, schemaName: p.schemaName });

export const createTable = (
  p: ps.OptionalRefParams & { schemaName?: string },
): Route =>
  database(p)
    .addStatic("data")
    .addStatic("create")
    .withQuery({ refName: p.refName, schemaName: p.schemaName });

export const branches = (p: ps.MaybeRefParams): Route =>
  database(p).addStatic("branches").withQuery({ refName: p.refName });

export const newBranch = (p: ps.OptionalRefParams): Route =>
  branches(p).addStatic("new").withQuery({ refName: p.refName });

export const defaultDoc = (p: ps.RefParams): Route =>
  database(p).addStatic("doc").addDynamic("refName", p.refName, ENCODE);

export const doc = (p: ps.DocParams): Route =>
  defaultDoc(p).addDynamic("docName", p.docName, ENCODE);

export const newDoc = (p: ps.RefParams): Route =>
  defaultDoc(p).addStatic("new");

export const commitLog = (p: ps.RefParams & { commitId?: string }): Route =>
  database(p)
    .addStatic("commits")
    .addDynamic("refName", p.refName, ENCODE)
    .withHash(p.commitId);

export const commitGraph = (p: ps.RefParams): Route =>
  commitLog(p).addStatic("graph");

export const commit = (p: ps.CommitParams): Route =>
  database(p)
    .addStatic("compare")
    .addDynamic("refName", p.refName, ENCODE)
    .addDynamic("diffRange", p.commitId);

export const diff = (p: ps.DiffParams): Route =>
  commit({ ...p, commitId: getDiffRange(p) });

export const compare = (p: ps.DatabaseParams): Route =>
  database(p).addStatic("compare");

function getDiffRange(p: ps.DiffParams): string {
  if (!p.fromCommitId && !p.toCommitId) return "";
  if (!p.toCommitId) return p.fromCommitId ?? "";
  return encodeURIComponent(`${p.fromCommitId ?? ""}..${p.toCommitId}`);
}

export const releases = (p: ps.OptionalRefParams): Route =>
  database(p).addStatic("releases").withQuery({ refName: p.refName });

export const remotes = (p: ps.OptionalRefParams): Route =>
  database(p).addStatic("remotes").withQuery({ refName: p.refName });

export const newRemote = (p: ps.DatabaseParams): Route =>
  remotes(p).addStatic("new");

const staticPulls = (p: ps.DatabaseParams) => database(p).addStatic("pulls");

export const pulls = (p: ps.PullParams): Route =>
  staticPulls(p).withQuery({
    refName: p.refName,
    from: p.fromBranchName,
  });

export const pullDiff = (p: ps.PullDiffParams): Route =>
  staticPulls(p)
    .addStatic("compare")
    .addDynamic("refName", p.refName, ENCODE)
    .addDynamic("fromBranchName", p.fromBranchName, ENCODE);

export const pullConflicts = (p: ps.PullDiffParamsOptionalTableName): Route =>
  staticPulls(p)
    .addStatic("conflicts")
    .addDynamic("refName", p.refName, ENCODE)
    .addDynamic("fromBranchName", p.fromBranchName, ENCODE)
    .withQuery({ tableName: p.tableName });

export const newRelease = (p: ps.OptionalRefParams): Route =>
  releases(p).addStatic("new").withQuery({ refName: p.refName });

export const upload = (p: ps.OptionalRefAndSchemaParams): Route =>
  database(p)
    .addStatic("upload")
    .withQuery({ schemaName: p.schemaName, branchName: p.refName });

export const uploadStage = (
  p: ps.UploadParamsWithOptions & {
    spreadsheet?: boolean;
    stage: string;
  },
): Route => {
  const q = p.branchName
    ? {
        branchName: p.branchName,
        tableName: p.tableName,
        schemaName: p.schemaName,
        spreadsheet: p.spreadsheet ? "true" : undefined,
      }
    : {};
  return upload(p)
    .addDynamic("uploadId", p.uploadId)
    .addDynamic("stage", p.stage)
    .withQuery(q);
};
