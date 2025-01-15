import DatabaseBreadcrumbs from "@components/breadcrumbs/DatabaseBreadcrumbs";
import { OptionalRefParams } from "@lib/params";
import cx from "classnames";
import { ReactNode } from "react";
import RightHeaderButtons from "./RightHeaderButtons";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams & { schemaName?: string };
  breadcrumbs?: ReactNode;
  showSmall: boolean;
};

export default function SmallDBHeader(props: Props) {
  return (
    <div
      className={cx(css.header, { [css.hideSmallHeader]: !props.showSmall })}
    >
      <div className={cx(css.headerDetails, css.smallHeader)}>
        <div>
          <div className={css.topLeft}>
            <span className={css.databaseBreadcrumbs}>
              {props.breadcrumbs ?? (
                <DatabaseBreadcrumbs params={props.params} />
              )}
            </span>
          </div>
        </div>
        <RightHeaderButtons params={props.params} />
      </div>
    </div>
  );
}
