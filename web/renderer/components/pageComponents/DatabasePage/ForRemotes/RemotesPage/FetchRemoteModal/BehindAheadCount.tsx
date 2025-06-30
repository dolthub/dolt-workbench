import { Tooltip } from "@dolthub/react-components";
import { RemoteBranchDiffCountsFragment } from "@gen/graphql-types";
import css from "./index.module.css";
import { getTooltipContent } from "./utils";

type Props = {
  counts?: RemoteBranchDiffCountsFragment;
  branch: string;
  remoteAndBranchName: string;
};

export default function BehindAheadCount({
  counts,
  branch,
  remoteAndBranchName,
}: Props) {
  const tooltipId = `${remoteAndBranchName}-ahead-behind-commits`;

  if (!counts)
    return (
      <td>
        <div className={css.count}>-</div>
      </td>
    );

  return (
    <td>
      <div
        data-tooltip-html={getTooltipContent(counts, branch)}
        data-tooltip-id={tooltipId}
        className={css.count}
      >
        <div className={css.behind}>{counts.behind}</div>
        <div className={css.ahead}>{counts.ahead}</div>
        <Tooltip
          id={tooltipId}
          noArrow
          place="bottom"
          hidden={!counts.ahead && !counts.behind}
        />
      </div>
    </td>
  );
}
