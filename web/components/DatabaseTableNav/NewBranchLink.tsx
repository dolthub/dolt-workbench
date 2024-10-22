import Link from "@components/links/Link";
import { Tooltip } from "@dolthub/react-components";
import { OptionalRefParams } from "@lib/params";
import { newBranch } from "@lib/urls";
import { IoAddOutline } from "@react-icons/all-files/io5/IoAddOutline";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams;
  open: boolean;
  doltDisabled?: boolean;
};

export default function NewBranchLink(props: Props) {
  return (
    <div
      className={cx(css.createBranch, {
        [css.createBranchDisabled]: !!props.doltDisabled,
      })}
    >
      <Link
        {...newBranch(props.params)}
        data-tooltip-id="create-branch"
        data-tooltip-content={
          props.doltDisabled ? "Use Dolt to create branch" : "Create new branch"
        }
        data-tooltip-place="top"
      >
        <IoAddOutline
          className={cx(css.createBranchIcon, {
            [css.closedItem]: !props.open,
          })}
        />
      </Link>
      <Tooltip id="create-branch" />
    </div>
  );
}
