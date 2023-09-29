import { ApolloError } from "@apollo/client";
import { render, screen } from "@testing-library/react";
import QueryHandler from ".";

const userData = {
  currentUser: {
    _id: "users/username",
    username: "new-user",
  },
};

type Props = {
  currentUser: typeof userData.currentUser;
};

const Component = (props: Props) => (
  <div>
    <div>My username</div>
    <div>{props.currentUser.username}</div>
  </div>
);

describe("tests QueryHandler", () => {
  it("renders loading state for QueryHandler", () => {
    render(
      <QueryHandler
        result={{
          loading: true,
          data: undefined as typeof userData | undefined,
          error: undefined,
        }}
        render={data => <Component currentUser={data.currentUser} />}
      />,
    );

    expect(screen.getByRole("progressbar")).toBeVisible();
    expect(
      screen.queryByText("No data returned by the server"),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("error-msg")).not.toBeInTheDocument();
    expect(screen.queryByText("My username")).not.toBeInTheDocument();
    expect(screen.queryByText("new-user")).not.toBeInTheDocument();
  });

  it("renders error state for QueryHandler", () => {
    render(
      <QueryHandler
        result={{
          loading: false,
          data: undefined as typeof userData | undefined,
          error: new ApolloError({ errorMessage: "user not found" }),
        }}
        render={data => <Component currentUser={data.currentUser} />}
      />,
    );

    expect(screen.getByLabelText("error-msg")).toBeVisible();
    expect(screen.getByText("user not found")).toBeVisible();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(
      screen.queryByText("No data returned by the server"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("My username")).not.toBeInTheDocument();
    expect(screen.queryByText("new-user")).not.toBeInTheDocument();
  });

  it("renders no data state with default message for QueryHandler", () => {
    render(
      <QueryHandler
        result={{
          loading: false,
          data: undefined as typeof userData | undefined,
          error: undefined,
        }}
        render={data => <Component currentUser={data.currentUser} />}
      />,
    );

    expect(screen.getByLabelText("error-msg")).toBeVisible();
    expect(screen.getByText("No data returned by the server")).toBeVisible();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByText("My username")).not.toBeInTheDocument();
    expect(screen.queryByText("new-user")).not.toBeInTheDocument();
  });

  it("renders no data state with custom message for QueryHandler", () => {
    render(
      <QueryHandler
        result={{
          loading: false,
          data: undefined as typeof userData | undefined,
          error: undefined,
        }}
        noDataMsg="No data so sad"
        render={data => <Component currentUser={data.currentUser} />}
      />,
    );

    expect(screen.getByLabelText("error-msg")).toBeVisible();
    expect(screen.getByText("No data so sad")).toBeVisible();
    expect(
      screen.queryByText("No data returned by the server"),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByText("My username")).not.toBeInTheDocument();
    expect(screen.queryByText("new-user")).not.toBeInTheDocument();
  });

  it("renders component with data for QueryHandler", () => {
    render(
      <QueryHandler
        result={{
          loading: false,
          data: userData,
          error: undefined,
        }}
        render={data => <Component currentUser={data.currentUser} />}
      />,
    );

    expect(screen.queryByLabelText("error-msg")).not.toBeInTheDocument();
    expect(
      screen.queryByText("No data returned by the server"),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.getByText("My username")).toBeVisible();
    expect(screen.getByText("new-user")).toBeVisible();
  });
});
