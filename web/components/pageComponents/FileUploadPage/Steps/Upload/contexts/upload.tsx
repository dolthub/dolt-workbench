import { ApolloError } from "@apollo/client";
import { useContextWithError, useSetState } from "@dolthub/react-hooks";
import { useLoadDataMutation } from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import useMutation from "@hooks/useMutation";
import { createCustomContext } from "@lib/createCustomContext";
import { TableParams } from "@lib/params";
import { refetchTableUploadQueries } from "@lib/refetchQueries";
import { table } from "@lib/urls";
import { useRouter } from "next/router";
import { Dispatch, ReactNode, useEffect } from "react";
import { useFileUploadContext } from "../../../contexts/fileUploadLocalForage";

const defaultState = {
  loading: false,
  spreadsheetOverlayOpen: false,
  error: undefined as ApolloError | Error | undefined,
};

export type UploadState = typeof defaultState;
export type UploadDispatch = Dispatch<Partial<UploadState>>;

type UploadContextType = {
  state: UploadState;
  setState: UploadDispatch;
  onUpload: () => Promise<void>;
};

export const UploadContext =
  createCustomContext<UploadContextType>("UploadContext");

type Props = {
  children: ReactNode;
};

export function UploadProvider(props: Props) {
  const { isDolt } = useDatabaseDetails();
  const router = useRouter();
  const { state: fuState, dbParams } = useFileUploadContext();
  const [state, setState] = useSetState({
    ...defaultState,
    spreadsheetOverlayOpen:
      router.query.spreadsheet === "true" &&
      !!router.query.branchName &&
      !!router.query.tableName,
  });
  const tableParams: TableParams = {
    ...dbParams,
    refName: fuState.branchName,
    tableName: fuState.tableName,
  };
  const {
    mutateFn: loadData,
    err,
    setErr,
  } = useMutation({
    hook: useLoadDataMutation,
    refetchQueries: refetchTableUploadQueries(tableParams, isDolt),
  });

  useEffect(() => {
    if (err) {
      setState({ error: err });
    }
  }, [err, setState]);

  const onUpload = async () => {
    if (!fuState.selectedFile) return;

    try {
      setState({ loading: true });
      const { errors } = await loadData({
        variables: {
          ...tableParams,
          file: fuState.selectedFile,
          importOp: fuState.importOp,
          fileType: fuState.fileType,
          modifier: fuState.modifier,
        },
      });
      if (errors?.length) return;
      const { href, as } = table(tableParams);
      router.push(href, as).catch(console.error);
    } catch (e) {
      setErr(e as ApolloError);
    } finally {
      setState({ loading: false });
    }
  };

  return (
    <UploadContext.Provider
      value={{
        state,
        setState,
        onUpload,
      }}
    >
      {props.children}
    </UploadContext.Provider>
  );
}

export default function useUploadContext() {
  return useContextWithError(UploadContext);
}
