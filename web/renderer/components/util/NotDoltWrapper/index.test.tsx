import { ApolloError } from "@apollo/client";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { setup, waitForQueryLoaders } from "@lib/testUtils.test";
import { screen } from "@testing-library/react";
import NotDoltWrapper from ".";
import * as mocks from "./mocks";

const TestChild = ({ doltDisabled = false }: { doltDisabled?: boolean }) => (
  <div data-testid="test-child">
    Test Child Component
    {doltDisabled && <span data-testid="dolt-disabled">Dolt Disabled</span>}
  </div>
);

const errorMock: MockedResponse = {
  request: { query: require("@gen/graphql-types").DoltDatabaseDetailsDocument },
  error: new ApolloError({ errorMessage: "Database connection failed" }),
};

describe("tests NotDoltWrapper", () => {
  const defaultProps = {
    children: <TestChild />,
  };

  it("shows loader when loading", () => {
    const loadingMock: MockedResponse = {
      request: { query: require("@gen/graphql-types").DoltDatabaseDetailsDocument },
      result: {
        data: null,
      },
      delay: 1000, // Simulate loading state
    };

    setup(
      <MockedProvider mocks={[loadingMock]}>
        <NotDoltWrapper {...defaultProps} />
      </MockedProvider>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows error message when query fails", async () => {
    setup(
      <MockedProvider mocks={[errorMock]}>
        <NotDoltWrapper {...defaultProps} />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    expect(screen.getByText(/Database connection failed/)).toBeInTheDocument();
  });

  it("renders children when isDolt is true", async () => {
    setup(
      <MockedProvider mocks={[mocks.databaseDetailsMock(true, false)]}>
        <NotDoltWrapper {...defaultProps} />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Child Component")).toBeInTheDocument();
    expect(screen.queryByTestId("dolt-disabled")).not.toBeInTheDocument();
  });

  it("returns false when hideNotDolt is true and not Dolt", async () => {
    const { container } = setup(
      <MockedProvider mocks={[mocks.databaseDetailsMock(false, false)]}>
        <NotDoltWrapper {...defaultProps} hideNotDolt />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    expect(container.firstChild).toBeNull();
  });

  it("shows NotDoltMsg when showNotDoltMsg is true and not Dolt", async () => {
    setup(
      <MockedProvider mocks={[mocks.databaseDetailsMock(false, false)]}>
        <NotDoltWrapper {...defaultProps} showNotDoltMsg />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    expect(
      screen.getByText(/This is not a Dolt database/)
    ).toBeInTheDocument();
    expect(screen.getByText("documentation")).toBeInTheDocument();
  });

  it("shows NotDoltMsg with feature name when provided", async () => {
    setup(
      <MockedProvider mocks={[mocks.databaseDetailsMock(false, false)]}>
        <NotDoltWrapper {...defaultProps} showNotDoltMsg feature="Branches" />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    expect(
      screen.getByText(/Branches is a Dolt feature and this is not a Dolt database/)
    ).toBeInTheDocument();
  });

  it("applies big styling when bigMsg is true", async () => {
    const { container } = setup(
      <MockedProvider mocks={[mocks.databaseDetailsMock(false, false)]}>
        <NotDoltWrapper {...defaultProps} showNotDoltMsg bigMsg />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    const msgContainer = container.querySelector(".big");
    expect(msgContainer).toBeInTheDocument();
  });

  it("applies custom className to NotDoltMsg", async () => {
    const customClass = "custom-class";
    const { container } = setup(
      <MockedProvider mocks={[mocks.databaseDetailsMock(false, false)]}>
        <NotDoltWrapper 
          {...defaultProps} 
          showNotDoltMsg 
          className={customClass} 
        />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    const msgContainer = container.querySelector(`.${customClass}`);
    expect(msgContainer).toBeInTheDocument();
  });

  it("clones children with doltDisabled when disableDoltFeature is true", async () => {
    // isDolt: false, hideDoltFeatures: false -> disableDoltFeature: true
    setup(
      <MockedProvider mocks={[mocks.databaseDetailsMock(false, false)]}>
        <NotDoltWrapper {...defaultProps} />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByTestId("dolt-disabled")).toBeInTheDocument();
  });

  it("renders empty div when hideDoltFeature is true", async () => {
    // isDolt: false, hideDoltFeatures: true -> hideDoltFeature: true
    const { container } = setup(
      <MockedProvider mocks={[mocks.databaseDetailsMock(false, true)]}>
        <NotDoltWrapper {...defaultProps} />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    expect(container.firstChild).toBeEmptyDOMElement();
    expect(screen.queryByTestId("test-child")).not.toBeInTheDocument();
  });

  it("prioritizes hideNotDolt over other conditions", async () => {
    const { container } = setup(
      <MockedProvider mocks={[mocks.databaseDetailsMock(false, false)]}>
        <NotDoltWrapper 
          {...defaultProps} 
          hideNotDolt 
          showNotDoltMsg 
          feature="Test Feature"
        />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText(/Test Feature/)).not.toBeInTheDocument();
  });

  it("prioritizes showNotDoltMsg over disableDoltFeature", async () => {
    setup(
      <MockedProvider mocks={[mocks.databaseDetailsMock(false, false)]}>
        <NotDoltWrapper {...defaultProps} showNotDoltMsg />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    expect(
      screen.getByText(/This is not a Dolt database/)
    ).toBeInTheDocument();
    expect(screen.queryByTestId("test-child")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dolt-disabled")).not.toBeInTheDocument();
  });

  it("handles postgres database type", async () => {
    setup(
      <MockedProvider mocks={[mocks.databaseDetailsMock(false, false, true)]}>
        <NotDoltWrapper {...defaultProps} />
      </MockedProvider>
    );

    await waitForQueryLoaders();

    // Should behave the same as non-Dolt MySQL - clone children with doltDisabled
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByTestId("dolt-disabled")).toBeInTheDocument();
  });
});