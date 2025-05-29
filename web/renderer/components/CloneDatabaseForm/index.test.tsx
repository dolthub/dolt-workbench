import { MockedProvider } from "@apollo/client/testing";
import { setup, waitForQueryLoaders } from "@lib/testUtils.test";
import { screen, waitFor } from "@testing-library/react";
import CloneDatabaseForm from ".";
import * as mocks from "./mocks";

// Mock next/router
const mockPush = jest.fn();
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("tests CloneDatabaseForm", () => {
  const defaultProps = {
    cloneDolt: false,
    setCloneDolt: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders error when no current connection", async () => {
    setup(
      <MockedProvider mocks={[mocks.currentConnectionNullMock]}>
        <CloneDatabaseForm {...defaultProps} />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    expect(
      screen.getByText("Could not find current connection.")
    ).toBeInTheDocument();
  });

  it("renders nothing for postgres connections", async () => {
    const { container } = setup(
      <MockedProvider mocks={[mocks.postgresConnectionMock]}>
        <CloneDatabaseForm {...defaultProps} />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    expect(container.firstChild).toBeNull();
  });

  it("renders clone form when cloneDolt is false", async () => {
    setup(
      <MockedProvider mocks={[mocks.currentConnectionMock]}>
        <CloneDatabaseForm {...defaultProps} />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    expect(
      screen.getByText("Clone a remote Dolt database from DoltHub")
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(screen.queryByText("Owner Name")).not.toBeInTheDocument();
  });

  it("renders form fields when cloneDolt is true", async () => {
    setup(
      <MockedProvider mocks={[mocks.currentConnectionMock]}>
        <CloneDatabaseForm {...defaultProps} cloneDolt />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    expect(
      screen.getByText("Clone a remote Dolt database from DoltHub")
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByText("Owner Name")).toBeInTheDocument();
    expect(screen.getByText("Remote Database Name")).toBeInTheDocument();
    expect(screen.getByText("New Database Name")).toBeInTheDocument();
  });

  it("toggles checkbox and calls setCloneDolt", async () => {
    const mockSetCloneDolt = jest.fn();
    const { user } = setup(
      <MockedProvider mocks={[mocks.currentConnectionMock]}>
        <CloneDatabaseForm
          {...defaultProps}
          setCloneDolt={mockSetCloneDolt}
          cloneDolt={false}
        />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(mockSetCloneDolt).toHaveBeenCalledWith(true);
  });

  it("shows disabled submit button when fields are empty", async () => {
    setup(
      <MockedProvider mocks={[mocks.currentConnectionMock]}>
        <CloneDatabaseForm {...defaultProps} cloneDolt />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    const submitButton = screen.getByText("Start Clone");
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when all fields are filled", async () => {
    const { user } = setup(
      <MockedProvider mocks={[mocks.currentConnectionMock]}>
        <CloneDatabaseForm {...defaultProps} cloneDolt />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    const textboxes = screen.getAllByRole("textbox");
    const ownerInput = textboxes[0]; // First textbox is Owner Name
    const remoteDbInput = textboxes[1]; // Second textbox is Remote Database Name

    await user.type(ownerInput, "dolthub");
    await user.type(remoteDbInput, "test-db");

    const submitButton = screen.getByText("Start Clone");
    expect(submitButton).not.toBeDisabled();
  });

  it("auto-fills new database name when remote database name changes", async () => {
    const { user } = setup(
      <MockedProvider mocks={[mocks.currentConnectionMock]}>
        <CloneDatabaseForm {...defaultProps} cloneDolt />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    const textboxes = screen.getAllByRole("textbox");
    const remoteDbInput = textboxes[1]; // Second textbox is Remote Database Name
    const newDbInput = textboxes[2]; // Third textbox is New Database Name

    await user.type(remoteDbInput, "test-database");

    expect(newDbInput).toHaveValue("test-database");
  });

  it("performs clone operation successfully", async () => {
    const { user } = setup(
      <MockedProvider mocks={[mocks.currentConnectionMock, mocks.doltCloneMock]}>
        <CloneDatabaseForm {...defaultProps} cloneDolt />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    const textboxes = screen.getAllByRole("textbox");
    const ownerInput = textboxes[0]; // First textbox is Owner Name
    const remoteDbInput = textboxes[1]; // Second textbox is Remote Database Name

    await user.type(ownerInput, "dolthub");
    await user.type(remoteDbInput, "test-db");

    const submitButton = screen.getByText("Start Clone");
    await user.click(submitButton);

    // Should navigate to the new database after successful clone
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: "/database/[databaseName]",
        }),
        expect.objectContaining({
          pathname: "/database/test-db",
        })
      );
    });
  });

  it("shows tooltip when button is disabled", async () => {
    const { user } = setup(
      <MockedProvider mocks={[mocks.currentConnectionMock]}>
        <CloneDatabaseForm {...defaultProps} cloneDolt />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    const submitButton = screen.getByText("Start Clone");
    
    // Hover over the disabled button to show tooltip
    await user.hover(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Database name is required.")).toBeInTheDocument();
    });
  });

  it("shows owner required tooltip when only database is filled", async () => {
    const { user } = setup(
      <MockedProvider mocks={[mocks.currentConnectionMock]}>
        <CloneDatabaseForm {...defaultProps} cloneDolt />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    const textboxes = screen.getAllByRole("textbox");
    const remoteDbInput = textboxes[1]; // Second textbox is Remote Database Name
    
    await user.type(remoteDbInput, "test-db");

    const submitButton = screen.getByText("Start Clone");
    await user.hover(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Owner name is required.")).toBeInTheDocument();
    });
  });
});