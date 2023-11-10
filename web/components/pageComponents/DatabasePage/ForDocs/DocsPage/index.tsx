import DocMarkdown from "@components/DocMarkdown";
import Page404 from "@components/Page404";
import DocBreadcrumbs from "@components/breadcrumbs/DocBreadcrumbs";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import QueryHandler from "@components/util/QueryHandler";
import {
  DocForDocPageFragment,
  useDocDataForDocPageQuery,
} from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import toDocType from "@lib/toDocType";
import { defaultDoc, doc } from "@lib/urls";
import DatabasePage from "../../component";
import NoDocsMsg from "../NoDocsMsg";
import DocList from "./DocList";
import css from "./index.module.css";

type InnerProps = {
  params: RefParams & { docName?: string };
  rowData?: DocForDocPageFragment;
};

export function Inner({ params, rowData }: InnerProps) {
  return (
    <div className={css.container}>
      <h1 className={css.title}>About</h1>
      <DocList params={params} />
      <DocMarkdown params={params} rowData={rowData} />
    </div>
  );
}

type Props = {
  params: RefParams & {
    docName?: string;
  };
  title?: string;
};

export default function DocsPage({ params, title }: Props) {
  const res = useDocDataForDocPageQuery({
    variables: { ...params, docType: toDocType(params.docName) },
  });

  return (
    <DatabasePage
      initialTabIndex={1}
      params={params}
      routeRefChangeTo={p =>
        params.docName
          ? doc({ ...params, docName: params.docName })
          : defaultDoc(p)
      }
      smallHeaderBreadcrumbs={<DocBreadcrumbs params={params} />}
      leftNavInitiallyOpen
      title={title}
    >
      <NotDoltWrapper showNotDoltMsg feature="Viewing docs" bigMsg>
        <QueryHandler
          result={res}
          errComponent={<Page404 title="Error fetching database" />}
          render={data =>
            data.docOrDefaultDoc ? (
              <Inner params={params} rowData={data.docOrDefaultDoc} />
            ) : (
              <NoDocsMsg params={params} />
            )
          }
        />
      </NotDoltWrapper>
    </DatabasePage>
  );
}
