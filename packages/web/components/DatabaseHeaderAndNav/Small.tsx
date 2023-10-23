import DatabaseBreadcrumbs from "@components/breadcrumbs/DatabaseBreadcrumbs";
import { DatabaseParams } from "@lib/params";
import cx from "classnames";
import { ReactNode } from "react";
import RightHeaderButtons from "./RightHeaderButtons";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams & { refName?: string };
  breadcrumbs?: ReactNode;
  setShowSmall: (s: boolean) => void;
  showSmall: boolean;
};

export default function SmallDBHeader(props: Props) {
  return (
    <div
      data-cy="small-db-page-header"
      className={cx(css.header, { [css.hideSmallHeader]: !props.showSmall })}
    >
      <div className={cx(css.headerDetails, css.smallHeader)}>
        <div>
          <div className={css.topLeft}>
            {/* <span className={css.visibility}>
              <RiGitRepositoryPrivateLine
                aria-label="private-lock-icon"
                className={css.icon}
              />
            </span> */}
            <span className={css.databaseBreadcrumbs}>
              {props.breadcrumbs ?? (
                <DatabaseBreadcrumbs params={props.params} />
              )}
            </span>
          </div>
        </div>
        <RightHeaderButtons
          params={props.params}
          onMenuClick={() => props.setShowSmall(false)}
        />
      </div>
    </div>
  );
}
