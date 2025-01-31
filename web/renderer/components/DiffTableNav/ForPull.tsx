import DiffSelector from "@components/DiffSelector";
import DiffStat from "@components/DiffStat";
import { PullDiffParams } from "@lib/params";
import DiffTableStats from "./DiffTableStats";
import DiffTableNav from "./component";

type Props = {
  params: PullDiffParams;
  tableName?: string;
};

export default function ForPull(props: Props) {
  const params = {
    ...props.params,
    fromRefName: props.params.fromBranchName,
    toRefName: props.params.refName,
  };
  return (
    <DiffTableNav
      {...props}
      diffSelector={<DiffSelector.ForPull params={props.params} />}
      diffStat={<DiffStat params={params} />}
      diffTables={
        <DiffTableStats connectionName={props.params.connectionName} />
      }
      forPull
    />
  );
}
