import {
  useContextWithError,
  useEffectAsync,
  useEffectOnMount,
  useSetState,
} from "@dolthub/react-hooks";
import { Route } from "@dolthub/web-utils";
import { ImportOperation } from "@gen/graphql-types";
import { createCustomContext } from "@lib/createCustomContext";
import { handleCaughtError } from "@lib/errors/helpers";
import { DatabaseParams, UploadParams } from "@lib/params";
import { uploadStage } from "@lib/urls";
import localForage from "localforage";
import { extendPrototype } from "localforage-getitems";
import { ReactNode, useState } from "react";
import {
  FileUploadLocalForageContextType,
  FileUploadState,
  getDefaultState,
} from "./state";

// Allows usage of `store.getItems()`
extendPrototype(localForage);

export const FileUploadLocalForageContext =
  createCustomContext<FileUploadLocalForageContextType>(
    "FileUploadLocalForageContext",
  );

type Props = {
  params: UploadParams & {
    tableName?: string;
    branchName?: string;
  };
  children: ReactNode;
  isDolt: boolean;
};

export function FileUploadLocalForageProvider(props: Props) {
  const dbParams: DatabaseParams = {
    databaseName: props.params.databaseName,
  };
  const name = `upload-${props.params.databaseName}-${props.params.uploadId}`;
  const store = localForage.createInstance({
    name,
  });
  const [initialLoad, setInitialLoad] = useState(true);
  const [updateLoad, setUpdateLoad] = useState(false);
  const [error, setError] = useState<Error>();
  const defaultState = getDefaultState(props.params);
  const [state, _setState] = useSetState(defaultState);

  function setState(s: Partial<FileUploadState>) {
    setUpdateLoad(true);
    _setState(s);
    Object.entries(s).forEach(([key, value]) => {
      if (key in state) {
        setItem(key as keyof FileUploadState, value);
      }
    });
    setUpdateLoad(false);
  }

  function setItem<T>(key: keyof FileUploadState, value: T) {
    _setState({ [key]: value });
    store
      .setItem(key, value)
      .then(() => setUpdateLoad(false))
      .catch(e => {
        handleCaughtError(e, setError);
        setUpdateLoad(false);
      });
  }

  // Set branchName and tableName if params provided
  useEffectOnMount(() => {
    if (props.params.tableName || props.params.branchName) {
      setState({
        tableName: props.params.tableName ?? "",
        branchName: props.params.branchName ?? "",
        importOp: ImportOperation.Update,
      });
    }
    if (!props.isDolt) {
      setState({ branchName: "main" });
    }
  });

  // Get local forage items on mount
  useEffectAsync(async ({ subscribed }) => {
    try {
      const res = await store.getItems();
      if (subscribed) {
        _setState({ ...defaultState, ...res });
      }
    } catch (err) {
      if (subscribed) handleCaughtError(err, setError);
    } finally {
      if (subscribed) setInitialLoad(false);
    }
  }, []);

  function getUploadUrl(stage: string): Route {
    return uploadStage({ ...props.params, stage });
  }

  return (
    <FileUploadLocalForageContext.Provider
      value={{
        initialLoad,
        updateLoad,
        error,
        setState,
        clear: async () => store.dropInstance({ name }),
        state,
        setItem,
        dbParams,
        getUploadUrl,
        isDolt: props.isDolt,
      }}
    >
      {props.children}
    </FileUploadLocalForageContext.Provider>
  );
}

export function useFileUploadContext(): FileUploadLocalForageContextType {
  return useContextWithError(FileUploadLocalForageContext);
}
