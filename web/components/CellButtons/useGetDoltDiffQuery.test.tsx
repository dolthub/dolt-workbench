import { MockedProvider } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import {
  getLpCellDiffQuery,
  getLpRowDiffQuery,
  getSaCellDiffQuery,
  getSaRowDiffQuery,
  lpCellProps,
  lpRowProps,
  saCellProps,
  saRowProps,
} from "./testData";
import { Props, ReturnType, useGetDoltDiffQuery } from "./useGetDoltDiffQuery";

async function renderUseGetDoltDiffQuery(
  props: Props,
  isPostgres = false,
): Promise<ReturnType> {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[databaseDetailsMock(true, true, isPostgres)]}>
      {children}
    </MockedProvider>
  );

  const { result } = renderHook(() => useGetDoltDiffQuery(props), { wrapper });
  await waitFor(() => result.current.isPostgres === isPostgres);
  return result.current;
}

type Test = { props: Props; expected: string; desc: string };

const tests = (isPG = false): Array<Test> => [
  {
    desc: "cell",
    props: lpCellProps,
    expected: getLpCellDiffQuery(isPG),
  },
  { desc: "row", props: lpRowProps, expected: getLpRowDiffQuery(isPG) },
  {
    desc: "cell with multiple PKs and PK with timestamp type",
    props: saCellProps,
    expected: getSaCellDiffQuery(isPG),
  },
  {
    desc: "row with multiple PKs and PK with timestamp type",
    props: saRowProps,
    expected: getSaRowDiffQuery(isPG),
  },
];

function executeTest(test: Test, isPostgres = false) {
  it(`[${isPostgres ? "postgres" : "mysql"}] converts table information to dolt_diff query for ${test.desc}`, async () => {
    const { generateQuery } = await renderUseGetDoltDiffQuery(
      test.props,
      isPostgres,
    );
    expect(generateQuery()).toBe(test.expected);
  });
}

describe("query conversions work for cell buttons", () => {
  tests().forEach(test => {
    executeTest(test);
  });

  tests(true).forEach(test => {
    executeTest(test, true);
  });
});
