import * as ps from "./params";
import { Route } from "./urlUtils";

const ENCODE = true;

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
