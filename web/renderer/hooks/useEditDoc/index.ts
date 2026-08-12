import { useApolloClient } from "@apollo/client";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { useSetState } from "@dolthub/react-hooks";
import { Maybe } from "@dolthub/web-utils";
import {
  DocType,
  useDeleteDocMutation,
  useSaveDocMutation,
} from "@gen/graphql-types";
import { ApolloErrorType } from "@lib/errors/types";
import { RefParams } from "@lib/params";
import { refetchUpdateDatabaseQueriesCacheEvict } from "@lib/refetchQueries";
import { SyntheticEvent } from "react";
import useMutation from "../useMutation";

type DocState = {
  docType: Maybe<DocType>;
  markdown: string;
  loading: boolean;
};

type SaveResult = { success: boolean };

type ReturnType = {
  state: DocState;
  setState: React.Dispatch<Partial<DocState>>;
  onSubmit: (e: SyntheticEvent) => Promise<SaveResult>;
  onDelete: (e: SyntheticEvent) => Promise<SaveResult>;
};

type DocMutationResult = {
  rowsAffected: Maybe<number>;
  queryString: string;
  executionMessage: string;
};

export default function useEditDoc(
  params: RefParams,
  defaultDocType: Maybe<DocType>,
  defaultMarkdown = "",
): ReturnType {
  const [state, setState] = useSetState({
    docType: defaultDocType,
    markdown: defaultMarkdown,
    loading: false,
  });
  const { setExecutedQuery, setExecutionError, setExecutionMessage } =
    useSqlEditorContext();
  const { mutateFn: saveFn } = useMutation({ hook: useSaveDocMutation });
  const { mutateFn: deleteFn } = useMutation({ hook: useDeleteDocMutation });
  const client = useApolloClient();

  const runDocMutation = async (
    e: SyntheticEvent,
    mutate: (docType: DocType) => Promise<{
      success: boolean;
      error?: ApolloErrorType;
      result?: Maybe<DocMutationResult>;
    }>,
  ): Promise<SaveResult> => {
    e.preventDefault();
    if (!state.docType || state.docType === DocType.Unspecified) {
      setExecutionError("A doc type must be selected");
      return { success: false };
    }
    setState({ loading: true });

    const res = await mutate(state.docType);

    if (res.success && res.result) {
      setExecutedQuery(res.result.queryString, { isMutation: true });
      setExecutionMessage(res.result.executionMessage);
      client
        .refetchQueries(refetchUpdateDatabaseQueriesCacheEvict)
        .catch(console.error);
      setState({ loading: false });
      return { success: true };
    }

    if (res.error) {
      setExecutionError(res.error.message);
    }
    setState({ loading: false });
    return { success: false };
  };

  const onSubmit = async (e: SyntheticEvent): Promise<SaveResult> =>
    runDocMutation(e, async docType => {
      const res = await saveFn({
        variables: {
          databaseName: params.databaseName,
          refName: params.refName,
          docType,
          markdown: state.markdown,
        },
      });
      return { ...res, result: res.data?.saveDoc };
    });

  const onDelete = async (e: SyntheticEvent): Promise<SaveResult> =>
    runDocMutation(e, async docType => {
      const res = await deleteFn({
        variables: {
          databaseName: params.databaseName,
          refName: params.refName,
          docType,
        },
      });
      return { ...res, result: res.data?.deleteDoc };
    });

  return { state, setState, onSubmit, onDelete };
}
