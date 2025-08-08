import { DatabaseConnectionFragment, DatabaseType } from "@gen/graphql-types";
import { ConfigState } from "./state";
import Link from "@components/links/Link";
import { connections as connectionsUrl } from "@lib/urls";

export function getConnectionUrl(state: ConfigState): string {
  if (state.connectionUrl) return state.connectionUrl;
  const prefix = state.type === DatabaseType.Mysql ? "mysql" : "postgresql";
  const password = state.password ? `:${state.password}` : "";
  return `${prefix}://${state.username}${password}@${state.host}:${state.port}`;
}

type GetCanSubmitReturnType = {
  canSubmit: boolean;
  message?: string;
};

export function getCanSubmit(state: ConfigState): GetCanSubmitReturnType {
  if (!state.name) {
    return { canSubmit: false, message: "Connection name is required" };
  }
  if (state.connectionUrl) return { canSubmit: true };
  if (!state.host || !state.username) {
    return { canSubmit: false, message: "Host or user name is required" };
  }
  return { canSubmit: true };
}

export type DisabledReturnType = {
  disabled: boolean;
  message?: React.ReactNode;
};

export function getStartLocalDoltServerDisabled(
  state: ConfigState,
  connections?: DatabaseConnectionFragment[],
): DisabledReturnType {
  const disabled =
    !state.name ||
    !state.port ||
    !!connections?.some(connection => connection.isLocalDolt) ||
    !!connections?.some(c => c.name === state.name);

  if (!disabled) {
    return { disabled };
  }
  if (!state.name) {
    return { disabled, message: <span>Connection name is required.</span> };
  }
  if (!state.port) {
    return { disabled, message: <span>Port is required.</span> };
  }
  if (connections?.some(connection => connection.isLocalDolt)) {
    return {
      disabled,
      message: (
        <div>
          <p>Already have one internal dolt server instance.</p>
          <p>
            Go to <Link {...connectionsUrl}>Connections</Link> and remove it
            before adding a new one.
          </p>
        </div>
      ),
    };
  }
  if (connections?.some(c => c.name === state.name)) {
    return {
      disabled,
      message: <span>Connection name already exists.</span>,
    };
  }
  return { disabled };
}
