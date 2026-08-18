import { fireEvent, screen, waitFor } from "@testing-library/react";
import { ReactNode, useState } from "react";
import { setup } from "@lib/testUtils.test";
import ConnectionTabs from "./ConnectionTabs";
import { ConfigContext } from "./context/config";
import { ConfigContextType, ConfigState, defaultState } from "./context/state";
import {
  getDoltLiteDatabaseFilePath,
  getSqliteConnectionUrl,
} from "./context/utils";

const originalForElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON;

beforeEach(() => {
  process.env.NEXT_PUBLIC_FOR_ELECTRON = "true";
});

afterAll(() => {
  if (originalForElectron === undefined) {
    delete process.env.NEXT_PUBLIC_FOR_ELECTRON;
    return;
  }
  process.env.NEXT_PUBLIC_FOR_ELECTRON = originalForElectron;
});

type ConfigHarnessProps = {
  children?: ReactNode;
  onSubmit?: ConfigContextType["onSubmit"];
};

function ConfigHarness({ children, onSubmit }: ConfigHarnessProps) {
  const [state, setConfigState] = useState<ConfigState>(defaultState);
  const setState: ConfigContextType["setState"] = nextState => {
    setConfigState(currentState => {
      return { ...currentState, ...nextState };
    });
  };

  return (
    <ConfigContext.Provider
      value={{
        state,
        setState,
        error: undefined,
        setErr: jest.fn(),
        clearState: jest.fn(),
        storedConnections: [],
        onSubmit: onSubmit ?? jest.fn(async () => undefined),
        onStartDoltServer: jest.fn(async () => undefined),
        onCloneDoltHubDatabase: jest.fn(async () => undefined),
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

async function selectType(
  user: ReturnType<typeof setup>["user"],
  label: string,
) {
  await user.click(screen.getByRole("combobox"));
  await user.click(await screen.findByText(label));
}

function renderSetup(props: Omit<ConfigHarnessProps, "children"> = {}) {
  return setup(
    <ConfigHarness {...props}>
      <ConnectionTabs />
    </ConfigHarness>,
  );
}

function expectToAppearBefore(first: HTMLElement, second: HTMLElement) {
  expect(
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
}

describe("ConnectionSetup", () => {
  it("does not offer SQLite/DoltLite in browser mode", async () => {
    process.env.NEXT_PUBLIC_FOR_ELECTRON = "false";
    const { user } = renderSetup();

    await user.click(screen.getByRole("combobox"));

    expect(screen.getByText("Postgres/Doltgres")).toBeInTheDocument();
    expect(screen.queryByText("SQLite/DoltLite")).not.toBeInTheDocument();
  });

  it("defaults to MySQL/Dolt in the existing three-tab flow", () => {
    renderSetup();

    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("MySQL/Dolt")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Connection")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();
    expectToAppearBefore(
      screen.getByText("Type"),
      screen.getByText("Connection Name"),
    );
  });

  it("keeps the three-tab flow for Postgres/Doltgres", async () => {
    const { user } = renderSetup();

    await selectType(user, "Postgres/Doltgres");

    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Connection")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();
    expect(screen.getByText("Connection Name")).toBeInTheDocument();
    expectToAppearBefore(
      screen.getByText("Type"),
      screen.getByText("Connection Name"),
    );
  });

  it("keeps only the About tab for SQLite/DoltLite", async () => {
    const { user } = renderSetup();

    await selectType(user, "SQLite/DoltLite");

    expect(screen.getByText("Choose an existing database")).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Choose an existing database" }),
    ).toBeChecked();
    expect(
      screen.getByText("Create a new DoltLite database"),
    ).toBeInTheDocument();
    expectToAppearBefore(
      screen.getByText("Type"),
      screen.getByText("Choose an existing database"),
    );
    expectToAppearBefore(
      screen.getByText("Choose an existing database"),
      screen.getByText("Create a new DoltLite database"),
    );
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.queryByText("Connection")).not.toBeInTheDocument();
    expect(screen.queryByText("Advanced")).not.toBeInTheDocument();

    await selectType(user, "MySQL/Dolt");

    expect(screen.getByText("Connection")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();
  });

  it("uses the selected SQLite file path as the connection name", async () => {
    const filePath = "/Users/me/My Databases/payroll.db";
    const invoke = jest.fn(async () => filePath);
    const onSubmit = jest.fn(async () => undefined);
    Object.defineProperty(window, "ipc", {
      configurable: true,
      value: { invoke },
    });

    const { user } = renderSetup({ onSubmit });

    await selectType(user, "SQLite/DoltLite");

    expect(screen.getByText("Hide Dolt features")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Launch Workbench" }),
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Choose File" }));

    expect(invoke).toHaveBeenCalledWith("select-sqlite-database-file");
    expect(
      screen.getByPlaceholderText("Choose an existing .db file"),
    ).toHaveValue(filePath);
    expect(
      screen.getByRole("button", { name: "Launch Workbench" }),
    ).toBeEnabled();

    fireEvent.submit(screen.getByTestId("connection-tab-form"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("encodes SQLite file paths without changing their identity", () => {
    const filePath = "/Users/me/50% off/a#b?.db";
    const connectionUrl = getSqliteConnectionUrl(filePath);

    expect(decodeURIComponent(new URL(connectionUrl).pathname)).toBe(filePath);
  });

  it("creates a new DoltLite database only when the form is submitted", async () => {
    const directory = "/Users/me/My Databases";
    const filePath = `${directory}/payroll.db`;
    const invoke = jest.fn(async (channel: string) => {
      if (channel === "select-sqlite-database-directory") return directory;
      return undefined;
    });
    const onSubmit = jest.fn(async () => undefined);
    Object.defineProperty(window, "ipc", {
      configurable: true,
      value: { invoke },
    });

    const { user } = renderSetup({ onSubmit });

    await selectType(user, "SQLite/DoltLite");
    await user.click(
      screen.getByRole("radio", { name: "Create a new DoltLite database" }),
    );
    expect(screen.queryByText("Hide Dolt features")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Choose Folder" }));
    await user.type(screen.getByPlaceholderText("my-database"), "payroll");

    expect(screen.getByText(/This will create/)).toHaveTextContent(
      `This will create payroll.db in ${directory}.`,
    );
    expect(invoke).not.toHaveBeenCalledWith(
      "create-doltlite-database-file",
      expect.anything(),
    );

    fireEvent.submit(screen.getByTestId("connection-tab-form"));

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith(
        "create-doltlite-database-file",
        filePath,
      );
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it("builds DoltLite database paths for macOS and Windows", () => {
    expect(getDoltLiteDatabaseFilePath("/Users/me/data/", "payroll")).toBe(
      "/Users/me/data/payroll.db",
    );
    expect(
      getDoltLiteDatabaseFilePath("C:\\Users\\me\\data", "payroll.db"),
    ).toBe("C:\\Users\\me\\data\\payroll.db");
  });
});
