import { DatabaseType } from "@gen/graphql-types";
import { ConfigState } from "./state";

export function getConnectionUrl(state: ConfigState): string {
  if (state.connectionUrl) return state.connectionUrl;
  const prefix = state.type === DatabaseType.Mysql ? "mysql" : "postgresql";
  return `${prefix}://${state.username}:${state.password}@${state.host}:${state.port}/${state.database}`;
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
