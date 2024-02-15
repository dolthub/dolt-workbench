import DiffTable from "@components/DiffTable";
import DiffTableNav from "@components/DiffTableNav";
import { DiffProvider, useDiffContext } from "@contexts/diff";
import { Loader } from "@dolthub/react-components";
import { RefParams } from "@lib/params";
import { commitLog } from "@lib/urls";
import { ReactNode } from "react";
import ForError from "../../ForError";
import DatabasePage from "../../component";
import css from "./index.module.css";

type InnerProps = {
  params: RefParams;
  smallHeaderBreadcrumbs?: ReactNode;
};

function Inner(props: InnerProps) {
  const { loading, error } = useDiffContext();
  if (loading) return <Loader loaded={false} />;
  if (error) return <ForError {...props} error={error} />;
  return (
    <DatabasePage
      params={props.params}
      initialTabIndex={2}
      leftTableNav={<DiffTableNav.ForCommits params={props.params} />}
      smallHeaderBreadcrumbs={props.smallHeaderBreadcrumbs}
      initialSmallHeader
      wide
      routeRefChangeTo={commitLog}
      title="commitDiff"
    >
      <div className={css.container}>
        <DiffTable params={props.params} />
      </div>
    </DatabasePage>
  );
}

type Props = {
  initialFromCommitId: string;
  initialToCommitId: string;
  params: RefParams;
  smallHeaderBreadcrumbs?: ReactNode;
  tableName?: string;
};

export default function DiffPage(props: Props) {
  return (
    <DiffProvider
      {...props}
      params={{
        ...props.params,
        fromRefName: props.initialFromCommitId,
        toRefName: props.initialToCommitId,
      }}
      initialTableName={props.tableName}
    >
      <Inner {...props} />
    </DiffProvider>
  );
}
