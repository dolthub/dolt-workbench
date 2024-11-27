import { DatabaseLayoutWrapperOuter } from "@components/layouts/DatabaseLayout/Wrapper";
import DatabaseLink from "@components/links/DatabaseLink";
import KeyNav from "@components/util/KeyNav";
import { Button } from "@dolthub/react-components";
import { DatabaseOptionalSchemaParams } from "@lib/params";
import { GoChevronLeft } from "@react-icons/all-files/go/GoChevronLeft";
import { ReactNode } from "react";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  params: DatabaseOptionalSchemaParams;
  children: ReactNode;
};

const forMacNav = process.env.NEXT_PUBLIC_FOR_MAC_NAV === "true";

export default function Layout(props: Props) {
  return (
    <DatabaseLayoutWrapperOuter {...props}>
      {/* <MobileWarning {...props} pageCrumb="file-upload" title="File uploads" /> */}
      <header className={css.header}>
        <div className={css.left}>
          <DatabaseLink params={props.params}>
            <GoChevronLeft className={css.chevron} />
          </DatabaseLink>
          <DatabaseLink params={props.params} className={css.databaseLink}>
            {props.params.databaseName}
          </DatabaseLink>
        </div>
        <h1>File Importer</h1>
        <div className={css.right}>
          <DatabaseLink params={props.params}>
            <Button>back to database</Button>
          </DatabaseLink>
        </div>
      </header>
      <div className={cx(css.outer, { [css.moreTopDistance]: forMacNav })}>
        <KeyNav className={css.main}>{props.children}</KeyNav>
      </div>
    </DatabaseLayoutWrapperOuter>
  );
}
