import UserNameWithIcon from "@components/UserNameWithIcon";
import RefLink from "@components/links/RefLink";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Button, Tooltip } from "@dolthub/react-components";
import { excerpt } from "@dolthub/web-utils";
import { BranchFragment } from "@gen/graphql-types";
import { FaLock } from "@react-icons/all-files/fa/FaLock";
import { FaRegTrashAlt } from "@react-icons/all-files/fa/FaRegTrashAlt";
import cx from "classnames";
import TimeAgo from "react-timeago";
import css from "./index.module.css";

const EXCERPT_LENGTH = 30;

type Props = {
  onDeleteClicked: () => void;
  branch: BranchFragment;
};

export default function BranchRow({
  branch,
  onDeleteClicked,
}: Props): JSX.Element {
  const tipText =
    branch.branchName.length >= EXCERPT_LENGTH ? branch.branchName : "";
  const tooltipId = `tooltip-${branch.branchName}`;
  return (
    <tr>
      <td id={tooltipId}>
        <RefLink
          params={{ ...branch, refName: branch.branchName }}
          data-tooltip-id={tooltipId}
          data-tooltip-content={tipText}
        >
          {excerpt(branch.branchName, EXCERPT_LENGTH)}
        </RefLink>
        {tipText.length !== 0 && <Tooltip id={tooltipId} />}
      </td>
      <td>
        <UserNameWithIcon username={branch.lastCommitter} />
      </td>
      <td>
        <TimeAgo date={branch.lastUpdated} />
      </td>
      <td className={css.trashColumn}>
        {branch.branchName === "master" || branch.branchName === "main" ? (
          <FaLock className={cx(css.icon, css.iconGray)} />
        ) : (
          <HideForNoWritesWrapper params={branch}>
            <Button.Link
              onClick={onDeleteClicked}
              red
              className={css.icon}
              aria-label="delete"
            >
              <FaRegTrashAlt />
            </Button.Link>
          </HideForNoWritesWrapper>
        )}
      </td>
    </tr>
  );
}
