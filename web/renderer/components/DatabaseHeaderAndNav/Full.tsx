import DatabaseNav from "@components/DatabaseNav";
import MobileDatabaseNav from "@components/DatabaseNav/ForMobile";
import { OptionalRefParams } from "@lib/params";
import cx from "classnames";
import RightHeaderButtons from "./RightHeaderButtons";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams & { schemaName?: string };
  title?: string;
  initialTabIndex: number;
  showSmall: boolean;
};

export default function Full(props: Props) {
  return (
    <div
      data-cy="db-page-header"
      className={cx(css.header, { [css.hideFullHeader]: props.showSmall })}
    >
      <div className={css.headerDetails}>
        <div className={css.zIndex}>
          <RightHeaderButtons {...props} />
          <div className={css.mobileSelector}>
            <MobileDatabaseNav {...props} />
          </div>
        </div>
      </div>
      <DatabaseNav {...props} />
    </div>
  );
}
