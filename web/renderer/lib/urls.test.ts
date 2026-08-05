import { UrlObject } from "url";
import { sqlQuery } from "./urls";

const params = {
  databaseName: "mydb",
  refName: "feature/branch+1",
};

function getAs(q: string, schemaName?: string): UrlObject {
  const { as } = sqlQuery({ ...params, q, schemaName });
  return as as UrlObject;
}

describe("sqlQuery url round-trip", () => {
  const queries = [
    "select * from t where a = 'b+c' and d = '100%'",
    "select 1;\nselect 2;",
    "select '\"quoted\"', 'ünïcodé', '🎉'",
    "insert into t values ('semi;colon', 'amp&ersand', 'eq=uals', 'hash#')",
    "select `col` from t where x = ? and y like '%_%'",
  ];

  queries.forEach(q => {
    it(`preserves query string: ${q.slice(0, 30)}`, () => {
      const as = getAs(q);
      expect((as.query as Record<string, string>).q).toBe(q);
    });
  });

  it("round-trips the encoded refName path segment", () => {
    const as = getAs("select 1");
    const refSegment = (as.pathname ?? "").split("/").pop() ?? "";
    expect(decodeURIComponent(refSegment)).toBe(params.refName);
  });

  it("preserves a non-empty schemaName", () => {
    const as = getAs("select 1", "myschema");
    expect((as.query as Record<string, string>).schemaName).toBe("myschema");
  });

  it("drops an empty schemaName", () => {
    const as = getAs("select 1", "");
    expect((as.query as Record<string, string>).schemaName).toBeUndefined();
  });
});
