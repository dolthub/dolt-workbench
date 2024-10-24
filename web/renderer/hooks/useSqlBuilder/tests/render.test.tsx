import { MockedProvider } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import useSqlBuilder from "..";

export async function renderUseSqlBuilder(isPostgres = false) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[databaseDetailsMock(true, true, isPostgres)]}>
      {children}
    </MockedProvider>
  );

  const { result } = renderHook(() => useSqlBuilder(), {
    wrapper,
  });
  await waitFor(() => result.current.isPostgres === isPostgres);
  return result.current;
}

describe("test renderUseSqlBuilder", () => {
  it("returns false for isPostgres", async () => {
    const { isPostgres } = await renderUseSqlBuilder();
    expect(isPostgres).toBeFalsy();
  });
  it("returns true for isPostgres", async () => {
    const { isPostgres } = await renderUseSqlBuilder(true);
    expect(isPostgres).toBeTruthy();
  });
});
