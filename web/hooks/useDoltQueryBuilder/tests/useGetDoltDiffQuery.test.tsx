import { ReturnType } from "../types";
import { Props, useGetDoltDiffQuery } from "../useGetDoltDiffQuery";
import { renderHookForMaybePostgres } from "./renderHookForMaybePostgres.test";
import * as td from "./testDataDiff";
import { Tests } from "./types";

async function renderUseGetDoltDiffQuery(
  args: Props,
  isPostgres = false,
): Promise<ReturnType> {
  return renderHookForMaybePostgres(args, useGetDoltDiffQuery, isPostgres);
}

const tests: Tests<Props> = [
  {
    desc: "cell",
    args: td.lpCellProps,
    expected: td.getLpCellDiffQuery,
  },
  { desc: "row", args: td.lpRowProps, expected: td.getLpRowDiffQuery },
  {
    desc: "cell with multiple PKs and PK with timestamp type",
    args: td.saCellProps,
    expected: td.getSaCellDiffQuery,
  },
  {
    desc: "row with multiple PKs and PK with timestamp type",
    args: td.saRowProps,
    expected: td.getSaRowDiffQuery,
  },
];

function executeTests(isPG = false) {
  tests.forEach(test => {
    it(`[${isPG ? "postgres" : "mysql"}] converts table information to dolt_diff query for ${test.desc}`, async () => {
      const { generateQuery } = await renderUseGetDoltDiffQuery(
        test.args,
        isPG,
      );
      expect(generateQuery()).toBe(test.expected(isPG));
    });
  });
}

describe("test useGetDoltDiffQuery", () => {
  // MySQL
  executeTests();
  // Postgres
  executeTests(true);
});
