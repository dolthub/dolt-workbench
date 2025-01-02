import { RemoteBranchDiffCountsFragment } from "@gen/graphql-types";
import { Tooltip } from "@dolthub/react-components";
import { getTooltipContent } from "./utils";
import css from "./index.module.css";

type Props = {
  counts: RemoteBranchDiffCountsFragment;
  currentBranch: string;
  remoteAndBranchName: string;
};

export default function BehindAheadCount({
  counts,
  currentBranch,
  remoteAndBranchName,
}: Props) {
  const { ahead, behind } = counts;
  const tooltipId = `${remoteAndBranchName}-ahead-behind-commits`;
  return (
    <td>
      <div
        data-tooltip-html={getTooltipContent(counts, currentBranch)}
        data-tooltip-id={tooltipId}
        className={css.count}
      >
        <div className={css.behind}>{behind}</div>
        <div className={css.ahead}>{ahead}</div>
        <Tooltip
          id={tooltipId}
          noArrow
          place="bottom"
          hidden={!ahead && !behind}
        />
      </div>
    </td>
  );
}
