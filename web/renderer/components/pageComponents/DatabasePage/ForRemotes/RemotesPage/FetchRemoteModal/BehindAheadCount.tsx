import { AheadAndBehindCountFragment } from "@gen/graphql-types";
import { Tooltip } from "@dolthub/react-components";
import { getTooltipContent } from "./utils";
import css from "./index.module.css";

type Props = {
  numbers: AheadAndBehindCountFragment;
  currentBranch: string;
  remoteAndBranchName: string;
};

export default function BehindAheadCount({
  numbers,
  currentBranch,
  remoteAndBranchName,
}: Props) {
  const { ahead, behind } = numbers;
  const tooltipId = `${remoteAndBranchName}-ahead-behind-commits`;
  return (
    <>
      <td
        data-tooltip-html={getTooltipContent(numbers, currentBranch)}
        data-tooltip-id={tooltipId}
        className={css.count}
      >
        <div className={css.behind}>{behind}</div>
        <div className={css.ahead}>{ahead}</div>
      </td>
      <Tooltip
        id={tooltipId}
        noArrow
        place="bottom"
        hidden={!ahead && !behind}
      />
    </>
  );
}
