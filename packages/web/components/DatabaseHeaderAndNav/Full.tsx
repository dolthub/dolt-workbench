import DatabaseNav from "@components/DatabaseNav";
import DatabaseBreadcrumbs from "@components/breadcrumbs/DatabaseBreadcrumbs";
import { OptionalRefParams } from "@lib/params";
import cx from "classnames";
import MobileHeaderSelector from "./MobileHeaderSelector";
import RightHeaderButtons from "./RightHeaderButtons";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams;
  title?: string;
  initialTabIndex: number;
  setShowSmall: (s: boolean) => void;
  showSmall: boolean;
};

export default function Full(props: Props) {
  return (
    <div
      data-cy="db-page-header"
      className={cx(css.header, { [css.hideFullHeader]: props.showSmall })}
    >
      <div className={css.headerDetails}>
        <div className={css.topLeft}>
          {/* <span className={css.visibility}>
            <RiGitRepositoryPrivateLine
              aria-label="private-lock-icon"
              className={css.icon}
            />
          </span> */}
          <DatabaseBreadcrumbs
            className={css.databaseBreadcrumbs}
            params={props.params}
          />
        </div>
        <div>
          <RightHeaderButtons
            {...props}
            onMenuClick={() => props.setShowSmall(true)}
          />
          <MobileHeaderSelector {...props} className={css.mobileSelector} />
        </div>
      </div>
      <DatabaseNav {...props} />
    </div>
  );
}
