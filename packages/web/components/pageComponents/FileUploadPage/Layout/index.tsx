import Button from "@components/Button";
import DatabaseBreadcrumbs from "@components/breadcrumbs/DatabaseBreadcrumbs";
import { DatabaseLayoutWrapperOuter } from "@components/layouts/DatabaseLayout/Wrapper";
import DatabaseLink from "@components/links/DatabaseLink";
import KeyNav from "@components/util/KeyNav";
import { DatabaseParams } from "@lib/params";
import { GoChevronLeft } from "@react-icons/all-files/go/GoChevronLeft";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams;
  children: ReactNode;
};

export default function Layout(props: Props) {
  return (
    <DatabaseLayoutWrapperOuter>
      {/* <MobileWarning {...props} pageCrumb="file-upload" title="File uploads" /> */}
      <header className={css.header}>
        <div className={css.left}>
          <DatabaseLink params={props.params}>
            <GoChevronLeft className={css.chevron} />
          </DatabaseLink>
          <DatabaseBreadcrumbs
            params={props.params}
            className={css.breadcrumbs}
          />
        </div>
        <h1>File Importer</h1>
        <div className={css.right}>
          <DatabaseLink params={props.params}>
            <Button>back to database</Button>
          </DatabaseLink>
        </div>
      </header>
      <div className={css.outer}>
        <KeyNav className={css.main}>{props.children}</KeyNav>
      </div>
    </DatabaseLayoutWrapperOuter>
  );
}
