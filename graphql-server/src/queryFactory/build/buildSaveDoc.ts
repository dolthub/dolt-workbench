import { EntityManager } from "typeorm";
import {
  Built,
  interpolateForDisplay,
  newParamAccumulator,
} from "./buildUtils";

const DOC_NAME = "doc_name";
const DOC_TEXT = "doc_text";

export function buildSaveDoc(
  em: EntityManager,
  target: string,
  docName: string,
  markdown: string,
): Built<unknown> {
  const driver = em.connection.driver;
  const escape = driver.escape.bind(driver);
  const acc = newParamAccumulator();
  const pName = bind(acc, docName);
  const pText = bind(acc, markdown);

  const escapedTarget = escape(target);
  const escapedDocName = escape(DOC_NAME);
  const escapedDocText = escape(DOC_TEXT);

  const isPostgres = em.connection.options.type === "postgres";
  const upsertClause = isPostgres
    ? `ON CONFLICT (${escapedDocName}) DO UPDATE SET ${escapedDocText} = EXCLUDED.${escapedDocText}`
    : `ON DUPLICATE KEY UPDATE ${escapedDocText} = VALUES(${escapedDocText})`;
  const namedSql = `INSERT INTO ${escapedTarget} (${escapedDocName}, ${escapedDocText}) VALUES (:${pName}, :${pText}) ${upsertClause}`;

  const [sql, rawParams] = driver.escapeQueryWithParameters(
    namedSql,
    acc.namedParams,
    {},
  );
  const params = rawParams.map(p => String(p));
  const displaySql = interpolateForDisplay(sql, params, acc.paramTypes);

  return {
    sql,
    params,
    displaySql,
    execute: async () => em.query(sql, rawParams),
  };
}

function bind(
  acc: {
    namedParams: Record<string, string>;
    paramTypes: Array<{ type?: string }>;
    idx: number;
  },
  value: string,
): string {
  const key = `p${acc.idx}`;
  acc.idx += 1;
  acc.namedParams[key] = value;
  acc.paramTypes.push({ type: "varchar" });
  return key;
}
