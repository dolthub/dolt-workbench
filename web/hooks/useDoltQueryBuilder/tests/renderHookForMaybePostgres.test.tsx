import { MockedProvider } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { ReturnType } from "../types";

export async function renderHookForMaybePostgres<Args>(
  args: Args,
  hook: (args: Args) => ReturnType,
  isPostgres = false,
): Promise<ReturnType> {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[databaseDetailsMock(true, true, isPostgres)]}>
      {children}
    </MockedProvider>
  );

  const { result } = renderHook(() => hook(args), {
    wrapper,
  });

  await waitFor(() => result.current.isPostgres === isPostgres);

  return result.current;
}

function useHook(args: string): ReturnType {
  return { generateQuery: () => args, isPostgres: false };
}

function useHookForPG(args: string): ReturnType {
  return { generateQuery: () => args, isPostgres: true };
}

describe("renderHookForMaybePostgres", () => {
  it("should return the correct result", async () => {
    const result = await renderHookForMaybePostgres("test", useHook);
    expect(result.generateQuery()).toBe("test");
    expect(result.isPostgres).toBe(false);
  });

  it("should return the correct result for postgres", async () => {
    const result = await renderHookForMaybePostgres("test", useHookForPG, true);
    expect(result.generateQuery()).toBe("test");
    expect(result.isPostgres).toBe(true);
  });
});
