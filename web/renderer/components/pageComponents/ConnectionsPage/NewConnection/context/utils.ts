import { DatabaseType } from "@gen/graphql-types";
import { ConfigState } from "./state";

export function getConnectionUrl(state: ConfigState): string {
  if (state.connectionUrl) return state.connectionUrl;
  const prefix = state.type === DatabaseType.Mysql ? "mysql" : "postgresql";
  return `${prefix}://${state.username}:${state.password}@${state.host}:${state.port}/${state.database}`;
}

export function getCanSubmit(state: ConfigState): boolean {
  if (!state.name) return false;
  if (state.connectionUrl) return true;
  if (!state.host || !state.username) return false;
  return true;
}
