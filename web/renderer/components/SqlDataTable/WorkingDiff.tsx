import DiffTable from "@components/DiffTable";
import DiffTableNav from "@components/DiffTableNav";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { DiffProvider, useDiffContext } from "@contexts/diff";
import { ErrorMsg, Loader } from "@dolthub/react-components";
import useSqlParser from "@hooks/useSqlParser";
import { RefOptionalSchemaParams } from "@lib/params";
import css from "./index.module.css";

type Props = {
  params: RefOptionalSchemaParams & { q: string };
};

function Inner() {
  const { loading, error, params, refName } = useDiffContext();
  if (loading) return <Loader loaded={false} />;
  if (error) return <ErrorMsg err={error} />;

  return (
    <div className={css.workingDiff}>
      <DiffTableNav.ForWorking params={{ ...params, refName }} />
      <DiffTable params={params} />
    </div>
  );
}

export default function WorkingDiff(props: Props) {
  const fromRefName = "HEAD";
  const toRefName = "WORKING";
  const params = { ...props.params, toRefName, fromRefName };

  const { getTableNames, loading } = useSqlParser(props.params.connectionName);
  if (loading) return <Loader loaded={false} />;
  const tns = getTableNames(params.q);

  return (
    <NotDoltWrapper connectionName={props.params.connectionName} hideNotDolt>
      <DiffProvider
        params={params}
        stayWithinPage
        initialTableName={tns ? tns[0] : undefined}
      >
        <Inner />
      </DiffProvider>
    </NotDoltWrapper>
  );
}
