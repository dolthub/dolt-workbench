import { MockedProvider } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import useSqlParser from "..";

export async function renderUseSqlParser(isPostgres = false) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[databaseDetailsMock(true, true, isPostgres)]}>
      {children}
    </MockedProvider>
  );

  const { result } = renderHook(() => useSqlParser(), {
    wrapper,
  });
  await waitFor(() => result.current.isPostgres === isPostgres);
  return result.current;
}

describe("test renderUseSqlParser", () => {
  it("returns false for isPostgres", async () => {
    const { isPostgres } = await renderUseSqlParser();
    expect(isPostgres).toBeFalsy();
  });
  it("returns true for isPostgres", async () => {
    const { isPostgres } = await renderUseSqlParser(true);
    expect(isPostgres).toBeTruthy();
  });
});
