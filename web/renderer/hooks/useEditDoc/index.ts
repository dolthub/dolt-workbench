import { useApolloClient } from "@apollo/client";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { useSetState } from "@dolthub/react-hooks";
import { Maybe } from "@dolthub/web-utils";
import { DocType, useSaveDocMutation } from "@gen/graphql-types";
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
  const { setExecutedQuery, setError, setExecutionMessage } =
    useSqlEditorContext();
  const { mutateFn } = useMutation({ hook: useSaveDocMutation });
  const client = useApolloClient();

  const onSubmit = async (e: SyntheticEvent): Promise<SaveResult> => {
    e.preventDefault();
    if (!state.docType || state.docType === DocType.Unspecified) {
      return { success: false };
    }
    setState({ loading: true });

    const res = await mutateFn({
      variables: {
        databaseName: params.databaseName,
        refName: params.refName,
        docType: state.docType,
        markdown: state.markdown,
      },
    });

    if (res.success && res.data?.saveDoc) {
      setExecutedQuery(res.data.saveDoc.queryString, { isMutation: true });
      setExecutionMessage(res.data.saveDoc.executionMessage);
      client
        .refetchQueries(refetchUpdateDatabaseQueriesCacheEvict)
        .catch(console.error);
      setState({ loading: false });
      return { success: true };
    }

    if (res.error) {
      setError(res.error);
    }
    setState({ loading: false });
    return { success: false };
  };

  return { state, setState, onSubmit };
}
