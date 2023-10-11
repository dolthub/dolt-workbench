import DocMarkdown from "@components/DocMarkdown";
import Loader from "@components/Loader";
import {
  useDocDataForDocPageQuery,
  useDocPageQueryNoBranch,
} from "@gen/graphql-types";
import useIsDolt from "@hooks/useIsDolt";
import { gqlTableNotFound } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import { OptionalRefParams, RefParams } from "@lib/params";
import toDocType from "@lib/toDocType";
import { defaultDoc } from "@lib/urls";
import ForError from "../ForError";
import ForNotDolt from "../ForNotDolt";
import DatabasePage from "../component";
import DocList from "./DocList";
import NoDocsMsg from "./NoDocsMsg";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams & {
    docName?: string;
  };
  title?: string;
  new?: boolean;
};

type InnerProps = {
  params: RefParams & { docName?: string };
  title?: string;
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

function DefaultBranch({ params, title }: Props) {
  const { data, error, loading } = useDocPageQueryNoBranch({
    variables: params,
  });
  const branchName = data?.branchOrDefault?.branchName;

  if (loading) return <Loader loaded={!loading} />;

  if (error) {
    return <ForError error={error} params={params} initialTabIndex={1} />;
  }

  if (!branchName) {
    return <NoDocsMsg params={params} />;
  }

  return <ForDocs params={{ ...params, refName: branchName }} title={title} />;
}

export default function ForDocs(props: Props) {
  const { isDolt } = useIsDolt();
  if (!isDolt) {
    return <ForNotDolt {...props} feature="Viewing and editing docs" />;
  }

  return props.params.refName ? (
    <Inner
      {...props}
      params={{ ...props.params, refName: props.params.refName }}
    />
  ) : (
    <DefaultBranch {...props} />
  );
}
