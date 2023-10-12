import { DocType } from "@gen/graphql-types";
import { ApolloErrorType } from "@lib/errors/types";
import { RefParams } from "@lib/params";
import { sqlQuery } from "@lib/urls";
import { useRouter } from "next/router";
import { SyntheticEvent } from "react";
import useSetState from "../useSetState";
import { getDocsQuery } from "./utils";

type DocState = {
  docType?: DocType;
  markdown: string;
};

type ResState = {
  error?: ApolloErrorType;
  loading: boolean;
};

type ReturnType = ResState & {
  state: DocState;
  setState: React.Dispatch<Partial<DocState>>;
  onSubmit: (e: SyntheticEvent) => Promise<void>;
};

export default function useEditDoc(
  params: RefParams,
  defaultDocType: DocType,
  defaultMarkdown = "",
): ReturnType {
  const [state, setState] = useSetState({
    docType: defaultDocType,
    markdown: defaultMarkdown,
  });
  const [res, setRes] = useSetState<ResState>({
    error: undefined,
    loading: false,
  });
  const router = useRouter();

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setRes({ loading: true, error: undefined });

    const { href, as } = sqlQuery({
      ...params,
      q: getDocsQuery(state.docType, state.markdown),
    });
    router.push(href, as).catch(console.error);
    setRes({ loading: false });
  };

  return { ...res, state, setState, onSubmit };
}
