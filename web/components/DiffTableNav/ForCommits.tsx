import DiffStat from "@components/DiffStat";
import { useDiffContext } from "@contexts/diff";
import { RefParams } from "@lib/params";
import CommitInfo from "./CommitInfo";
import DiffTableStats from "./DiffTableStats";
import DiffTableNav from "./component";

type Props = {
  params: RefParams;
};

export default function ForCommits(props: Props) {
  const { params, refName } = useDiffContext();
  return (
    <DiffTableNav
      {...props}
      diffStat={<DiffStat params={{ ...params, refName }} />}
      diffSelector={
        <CommitInfo
          params={{
            ...params,
            refName: props.params.refName,
            toCommitId: params.toRefName,
            fromCommitId: params.fromRefName,
          }}
        />
      }
      diffTables={<DiffTableStats />}
    />
  );
}
