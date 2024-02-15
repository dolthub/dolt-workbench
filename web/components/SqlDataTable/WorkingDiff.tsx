import DiffTable from "@components/DiffTable";
import DiffTableNav from "@components/DiffTableNav";
import ErrorMsg from "@components/ErrorMsg";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { DiffProvider, useDiffContext } from "@contexts/diff";
import { Loader } from "@dolthub/react-components";
import useSqlParser from "@hooks/useSqlParser";
import { RefParams } from "@lib/params";
import css from "./index.module.css";

type Props = {
  params: RefParams & { q: string };
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

  const { getTableNames } = useSqlParser();
  const tns = getTableNames(params.q);

  return (
    <NotDoltWrapper hideNotDolt>
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
