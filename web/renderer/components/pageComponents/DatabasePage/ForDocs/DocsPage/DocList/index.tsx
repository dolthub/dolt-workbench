import { QueryHandler } from "@dolthub/react-components";
import {
  DocListForDocPageFragment,
  useDocsRowsForDocPageQuery,
} from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import DocListItem from "./Item";
import NewDocButton from "./NewDocButton";
import css from "./index.module.css";

type Props = {
  params: RefParams & { docName?: string };
};

type InnerProps = Props & {
  docs: DocListForDocPageFragment;
};

function Inner({ docs, params }: InnerProps) {
  const canCreateNewDoc = docs.list.length < 3;
  return (
    <div className={css.docsContainer}>
      {docs.list.length > 0 && (
        <ol className={css.docs} data-cy="db-docs-list">
          {docs.list.map(r => {
            const docName = r.docRow?.columnValues[0].displayValue;
            const firstDocName =
              docs.list[0].docRow?.columnValues[0].displayValue;
            return (
              <DocListItem
                key={docName}
                params={params}
                rowData={r}
                active={
                  params.docName === docName ||
                  (!params.docName && docName === firstDocName)
                }
              />
            );
          })}
        </ol>
      )}
      {canCreateNewDoc && <NewDocButton params={params} />}
    </div>
  );
}

export default function DocList(props: Props) {
  const res = useDocsRowsForDocPageQuery({ variables: props.params });
  return (
    <QueryHandler
      result={res}
      render={data => <Inner {...props} docs={data.docs} />}
    />
  );
}
