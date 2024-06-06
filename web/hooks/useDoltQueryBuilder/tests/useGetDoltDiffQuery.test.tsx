import { ReturnType } from "../types";
import { Props, useGetDoltDiffQuery } from "../useGetDoltDiffQuery";
import { renderHookForMaybePostgres } from "./renderHookForMaybePostgres.test";
import * as td from "./testDataDiff";
import { Test, Tests } from "./types";

async function renderUseGetDoltDiffQuery(
  args: Props,
  isPostgres = false,
): Promise<ReturnType> {
  return renderHookForMaybePostgres(args, useGetDoltDiffQuery, isPostgres);
}

const tests = (isPG = false): Tests<Props> => [
  {
    desc: "cell",
    args: td.lpCellProps,
    expected: td.getLpCellDiffQuery(isPG),
  },
  { desc: "row", args: td.lpRowProps, expected: td.getLpRowDiffQuery(isPG) },
  {
    desc: "cell with multiple PKs and PK with timestamp type",
    args: td.saCellProps,
    expected: td.getSaCellDiffQuery(isPG),
  },
  {
    desc: "row with multiple PKs and PK with timestamp type",
    args: td.saRowProps,
    expected: td.getSaRowDiffQuery(isPG),
  },
];

function executeTest(test: Test<Props>, isPostgres = false) {
  it(`[${isPostgres ? "postgres" : "mysql"}] converts table information to dolt_diff query for ${test.desc}`, async () => {
    const { generateQuery } = await renderUseGetDoltDiffQuery(
      test.args,
      isPostgres,
    );
    expect(generateQuery()).toBe(test.expected);
  });
}

describe("query conversions work for cell buttons", () => {
  // MySQL
  tests().forEach(test => {
    executeTest(test);
  });

  // Postgres
  tests(true).forEach(test => {
    executeTest(test, true);
  });
});
