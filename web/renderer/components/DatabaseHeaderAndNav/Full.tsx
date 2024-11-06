import DatabaseNav from "@components/DatabaseNav";
import MobileDatabaseNav from "@components/DatabaseNav/ForMobile";
import DatabaseTypeLabel from "@components/DatabaseTypeLabel";
import DatabaseBreadcrumbs from "@components/breadcrumbs/DatabaseBreadcrumbs";
import { OptionalRefParams } from "@lib/params";
import cx from "classnames";
import RightHeaderButtons from "./RightHeaderButtons";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams & { schemaName?: string };
  title?: string;
  initialTabIndex: number;
  setShowSmall: (s: boolean) => void;
  showSmall: boolean;
  showHeaderDetails?: boolean;
};

export default function Full(props: Props) {
  return (
    <div
      data-cy="db-page-header"
      className={cx(css.header, { [css.hideFullHeader]: props.showSmall })}
    >
      {props.showHeaderDetails && (
        <div className={css.headerDetails}>
          <div className={css.topLeft}>
            <DatabaseBreadcrumbs
              className={css.databaseBreadcrumbs}
              params={props.params}
            />
            <DatabaseTypeLabel className={css.permission} />
          </div>
          <div>
            <RightHeaderButtons
              {...props}
              onMenuClick={() => props.setShowSmall(true)}
            />
            <div className={css.mobileSelector}>
              <MobileDatabaseNav {...props} />
            </div>
          </div>
        </div>
      )}
      <DatabaseNav {...props} />
    </div>
  );
}
