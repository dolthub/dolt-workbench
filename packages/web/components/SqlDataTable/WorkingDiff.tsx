import DiffTable from "@components/DiffTable";
import DiffTableNav from "@components/DiffTableNav";
import ErrorMsg from "@components/ErrorMsg";
import Loader from "@components/Loader";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { DiffProvider, useDiffContext } from "@contexts/diff";
import { RefParams } from "@lib/params";
import css from "./index.module.css";

type Props = {
  params: RefParams;
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
  const fromCommitId = "HEAD";
  const toCommitId = "WORKING";
  const params = { ...props.params, toCommitId, fromCommitId };
  return (
    <NotDoltWrapper hideNotDolt>
      <DiffProvider params={params} stayWithinPage>
        <Inner />
      </DiffProvider>
    </NotDoltWrapper>
  );
}
