import { DatabaseType } from "@gen/graphql-types";
import { SetApolloErrorType } from "@lib/errors/types";
import { Dispatch, SyntheticEvent } from "react";

export const defaultState = {
  name: "",
  host: "",
  hostPlaceholder: "127.0.0.1",
  port: "3306",
  username: "root",
  password: "",
  database: "",
  connectionUrl: "",
  hideDoltFeatures: false,
  useSSL: true,
  showAbout: true,
  showConnectionDetails: false,
  showAdvancedSettings: false,
  loading: false,
  type: DatabaseType.Mysql,
  isLocalDolt: false,
};

export type ConfigState = typeof defaultState;
export type ConfigDispatch = Dispatch<Partial<ConfigState>>;

export function getDefaultState(isDocker = false): ConfigState {
  const defaultHost = isDocker ? "host.docker.internal" : "127.0.0.1";
  return {
    ...defaultState,
    host: defaultHost,
    hostPlaceholder: defaultHost,
  };
}

export type ConfigContextType = {
  onSubmit: (e: SyntheticEvent) => Promise<void>;
  state: ConfigState;
  setState: ConfigDispatch;
  error?: Error | undefined;
  setErr: SetApolloErrorType;
  clearState: () => void;
};
