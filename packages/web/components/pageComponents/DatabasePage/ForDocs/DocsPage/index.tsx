import DocMarkdown from "@components/DocMarkdown";
import Loader from "@components/Loader";
import {
  DocForDocPageFragment,
  useDocDataForDocPageQuery,
} from "@gen/graphql-types";
import { gqlTableNotFound } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import { RefParams } from "@lib/params";
import toDocType from "@lib/toDocType";
import { defaultDoc } from "@lib/urls";
import ForError from "../../ForError";
import DatabasePage from "../../component";
import NoDocsMsg from "../NoDocsMsg";
import DocList from "./DocList";
import css from "./index.module.css";

type InnerProps = {
  params: RefParams & { docName?: string };
  rowData?: DocForDocPageFragment;
  title?: string;
};

export function Inner({ params, rowData, title }: InnerProps) {
  return (
    <DatabasePage
      initialTabIndex={1}
      params={params}
      routeRefChangeTo={defaultDoc}
      // smallHeaderBreadcrumbs={
      //   params.docName && (
      //     <DocBreadcrumbs params={{ ...params, docName: params.docName }} />
      //   )
      // }
      leftNavInitiallyOpen
      title={title}
    >
      <div className={css.container}>
        <h1 className={css.title}>About</h1>
        <DocList params={params} />
        <DocMarkdown params={params} rowData={rowData} />
      </div>
    </DatabasePage>
  );
}

type Props = {
  params: RefParams & {
    docName?: string;
  };
  title?: string;
};

export default function DocsPage({ params, title }: Props) {
  const { data, error, loading } = useDocDataForDocPageQuery({
    variables: { ...params, docType: toDocType(params.docName) },
  });

  if (loading) {
    return (
      <DatabasePage
        title={title}
        initialTabIndex={1}
        params={params}
        leftNavInitiallyOpen
        routeRefChangeTo={defaultDoc}
      >
        <Loader loaded={false} />
      </DatabasePage>
    );
  }

  if (error && !errorMatches(gqlTableNotFound, error)) {
    return (
      <ForError
        error={error}
        params={params}
        initialTabIndex={1}
        routeRefChangeTo={defaultDoc}
      />
    );
  }

  if (errorMatches(gqlTableNotFound, error) || !data?.docOrDefaultDoc) {
    return <NoDocsMsg params={params} />;
  }

  return <Inner params={params} rowData={data.docOrDefaultDoc} />;
}
