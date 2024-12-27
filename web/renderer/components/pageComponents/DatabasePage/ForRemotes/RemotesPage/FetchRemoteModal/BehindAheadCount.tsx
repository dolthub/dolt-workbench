import { AheadOrBehindFragment } from "@gen/graphql-types";
import { Tooltip } from "@dolthub/react-components";
import { getTooltipContent } from "./utils";
import css from "./index.module.css";

type Props = {
  numbers: AheadOrBehindFragment;
};

export default function BehindAheadCount({ numbers }: Props) {
  const { ahead, behind } = numbers;
  return (
    <>
      <td
        data-tooltip-html={getTooltipContent(numbers)}
        data-tooltip-id="ahead-behind-commits"
        className={css.count}
      >
        <div className={css.behind}>{behind}</div>
        <div className={css.ahead}>{ahead}</div>
      </td>
      <Tooltip id="ahead-behind-commits" noArrow place="bottom" />
    </>
  );
}
