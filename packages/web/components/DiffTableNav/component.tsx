import { DatabaseParams } from "@lib/params";
import { GiHamburgerMenu } from "@react-icons/all-files/gi/GiHamburgerMenu";
import cx from "classnames";
import { ReactNode, useState } from "react";
import BackButton from "./BackButton";
import css from "./index.module.css";

type Params = DatabaseParams & {
  refName?: string;
};

type Props = {
  params: Params;
  diffStat: ReactNode;
  diffSelector?: ReactNode;
  diffTables?: ReactNode;
  white?: boolean;
  forPull?: boolean;
  diffCommits?: ReactNode;
};

export default function DiffTableNav({ white = false, ...props }: Props) {
  const [open, setOpen] = useState(true);
  const toggleMenu = () => {
    setOpen(!open);
  };

  return (
    <div
      className={cx(
        css.container,
        css[open ? "openContainer" : "closedContainer"],
        { [css.whiteBg]: white },
      )}
    >
      {!!props.diffSelector && (
        <div className={css.top}>
          <BackButton
            params={props.params}
            open={open}
            forPull={props.forPull}
          />
          <GiHamburgerMenu
            onClick={toggleMenu}
            className={css.menuIcon}
            data-cy="left-diff-nav-toggle-icon"
          />
        </div>
      )}
      <div className={css[open ? "openItem" : "closedItem"]}>
        {props.diffSelector}
        <div className={css.overview}>
          <h4>Diff Overview</h4>
          {props.diffStat}
        </div>
        {props.diffTables}
        {props.diffCommits}
      </div>
    </div>
  );
}
