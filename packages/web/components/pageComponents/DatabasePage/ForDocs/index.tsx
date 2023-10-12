import DocMarkdown from "@components/DocMarkdown";
import Loader from "@components/Loader";
import { useDocDataForDocPageQuery } from "@gen/graphql-types";
import useIsDolt from "@hooks/useIsDolt";
import { gqlTableNotFound } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import { RefParams } from "@lib/params";
import toDocType from "@lib/toDocType";
import { defaultDoc } from "@lib/urls";
import ForError from "../ForError";
import ForNotDolt from "../ForNotDolt";
import DatabasePage from "../component";
import DocList from "./DocList";
import NoDocsMsg from "./NoDocsMsg";
import css from "./index.module.css";

type InnerProps = {
  params: RefParams & { docName?: string };
  title?: string;
};

type Props = InnerProps & {
  new?: boolean;
};

function Inner({ params, title }: InnerProps) {
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
    return <ForError error={error} params={params} initialTabIndex={1} />;
  }
  if (errorMatches(gqlTableNotFound, error) || !data?.docOrDefaultDoc) {
    return <NoDocsMsg params={params} title={title} />;
  }

  return (
    <DatabasePage
      initialTabIndex={1}
      params={params}
      // smallHeaderBreadcrumbs={
      //   params.docName && (
      //     <DocBreadcrumbs params={{ ...params, docName: params.docName }} />
      //   )
      // }
      leftNavInitiallyOpen
      title={title}
      routeRefChangeTo={defaultDoc}
    >
      <div className={css.container}>
        <h1 className={css.title}>About</h1>
        <DocList params={params} />
        <DocMarkdown
          params={params}
          rowData={data.docOrDefaultDoc}
          hiddenForMobile
        />
      </div>
    </DatabasePage>
  );
}

export default function ForDocs(props: Props) {
  const { isDolt } = useIsDolt();
  if (!isDolt) {
    return <ForNotDolt {...props} feature="Viewing and editing docs" />;
  }

  return (
    <Inner
      {...props}
      params={{ ...props.params, refName: props.params.refName }}
    />
  );
}
