import { MockedProvider } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import {
  lpCellDiffQuery,
  lpCellProps,
  lpRowDiffQuery,
  lpRowProps,
  saCellDiffQuery,
  saCellProps,
  saRowDiffQuery,
  saRowProps,
} from "./testData";
import { Props, useGetDoltDiffQuery } from "./useGetDoltDiffQuery";

function renderUseGetDoltDiffQuery(
  props: Props,
  isPostgres = false,
): () => string {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[databaseDetailsMock(true, true, isPostgres)]}>
      {children}
    </MockedProvider>
  );

  const { result } = renderHook(() => useGetDoltDiffQuery(props), { wrapper });
  return result.current;
}

const tests: Array<{ props: Props; expected: string; desc: string }> = [
  { desc: "cell", props: lpCellProps, expected: lpCellDiffQuery },
  { desc: "row", props: lpRowProps, expected: lpRowDiffQuery },
  {
    desc: "cell with multiple PKs and PK with timestamp type",
    props: saCellProps,
    expected: saCellDiffQuery,
  },
  {
    desc: "row with multiple PKs and PK with timestamp type",
    props: saRowProps,
    expected: saRowDiffQuery,
  },
];

describe("query conversions work for cell buttons", () => {
  tests.forEach(({ desc, props, expected }) => {
    it(`[mysql] converts table information to dolt_diff query for ${desc}`, () => {
      const generateQuery = renderUseGetDoltDiffQuery(props);
      expect(generateQuery()).toBe(expected);
    });
  });

  tests.forEach(({ desc, props, expected }) => {
    it(`[postgres] converts table information to dolt_diff query for ${desc}`, () => {
      const generateQuery = renderUseGetDoltDiffQuery(props);
      expect(generateQuery()).toBe(expected);
    });
  });
});
