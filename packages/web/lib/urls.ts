import * as ps from "./params";
import { Route } from "./urlUtils";

const ENCODE = true;
export type DatabaseUrl = (p: ps.DatabaseParams) => Route;
export type RefUrl = (p: ps.RefParams) => Route;

export const database = (p: ps.DatabaseParams): Route => {
  const d = new Route("/database");
  return d.addDynamic("databaseName", p.databaseName);
};

export const query = (p: ps.RefParams): Route =>
  database(p).addStatic("query").addDynamic("refName", p.refName, ENCODE);

export const sqlQuery = (p: ps.SqlQueryParams): Route =>
  query(p).withQuery({ q: p.q, active: p.active });

export const ref = (p: ps.RefParams): Route =>
  database(p).addStatic("data").addDynamic("refName", p.refName, ENCODE);

export const table = (p: ps.TableParams): Route =>
  ref(p).addDynamic("tableName", p.tableName);

export const editTable = (p: ps.TableParams): Route =>
  table(p).withQuery({ edit: "true" });

export const schemaDiagram = (p: ps.RefParams & { active?: string }): Route =>
  database(p)
    .addStatic("schema")
    .addDynamic("refName", p.refName, ENCODE)
    .withQuery({ active: p.active });

export const createTable = (p: ps.OptionalRefParams): Route =>
  database(p)
    .addStatic("data")
    .addStatic("create")
    .withQuery({ refName: p.refName });

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
