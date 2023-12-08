import {
  DatabaseType,
  useAddDatabaseConnectionMutation,
} from "@gen/graphql-types";
import useSetState from "@hooks/useSetState";
import { maybeDatabase } from "@lib/urls";
import { useRouter } from "next/router";
import { Dispatch, SyntheticEvent } from "react";

const defaultState = {
  name: "",
  host: "",
  port: "3306",
  username: "root",
  password: "",
  database: "",
  connectionUrl: "",
  hideDoltFeatures: false,
  useSSL: true,
  showAdvancedSettings: false,
  loading: false,
  type: DatabaseType.Mysql,
};

type ConfigState = typeof defaultState;
type ConfigDispatch = Dispatch<Partial<ConfigState>>;

type ReturnType = {
  onSubmit: (e: SyntheticEvent) => Promise<void>;
  state: ConfigState;
  setState: ConfigDispatch;
  error?: Error | undefined;
  clearState: () => void;
};

export default function useConfig(): ReturnType {
  const router = useRouter();
  const [state, setState] = useSetState(defaultState);
  const [addDb, res] = useAddDatabaseConnectionMutation();

  const clearState = () => {
    setState(defaultState);
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setState({ loading: true });
    const url =
      state.connectionUrl ||
      `${state.type === DatabaseType.Mysql ? "mysql" : "postgresql"}://${
        state.username
      }:${state.password}@${state.host}:${state.port}/${state.database}`;

    try {
      const db = await addDb({
        variables: {
          name: state.name,
          connectionUrl: url,
          hideDoltFeatures: state.hideDoltFeatures,
          useSSL: state.useSSL,
          type: state.type,
        },
      });
      await res.client.clearStore();
      if (!db.data) {
        return;
      }

      const { href, as } = maybeDatabase(db.data.addDatabaseConnection);
      await router.push(href, as);
    } catch (_) {
      // Handled by res.error
    } finally {
      setState({ loading: false });
    }
  };

  return { onSubmit, state, setState, error: res.error, clearState };
}
