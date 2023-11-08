import DiffSelector from "@components/DiffSelector";
import DiffStat from "@components/DiffStat";
import { PullParams } from "@lib/params";
import DiffTableStats from "./DiffTableStats";
import DiffTableNav from "./component";
import css from "./index.module.css";

type Props = {
  params: PullParams;
  tableName?: string;
};

export default function ForPull(props: Props) {
  const selector = <DiffSelector.ForPull params={props.params} />;
  if (!props.params.fromBranchName || !props.params.toBranchName) {
    return (
      <DiffTableNav
        {...props}
        diffSelector={selector}
        diffStat={
          <p className={css.noDiff} data-cy="diff-layout-no-diff">
            Select branches to view diff
          </p>
        }
        diffTables={null}
        forPull
      />
    );
  }
  return (
    <DiffTableNav
      {...props}
      diffSelector={selector}
      diffStat={
        <DiffStat
          params={{
            ...props.params,
            fromRefName: props.params.fromBranchName,
            toRefName: props.params.toBranchName,
          }}
        />
      }
      diffTables={<DiffTableStats />}
      forPull
    />
  );
}
