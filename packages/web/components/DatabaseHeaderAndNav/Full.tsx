import DatabaseNav from "@components/DatabaseNav";
import DatabaseBreadcrumbs from "@components/breadcrumbs/DatabaseBreadcrumbs";
import MobileHeaderSelector from "./MobileHeaderSelector";
import css from "./index.module.css";

type Props = {
  params: { refName?: string };
  title?: string;
  initialTabIndex: number;
};

export default function Full(props: Props) {
  return (
    <div data-cy="db-page-header" className={css.header}>
      <div className={css.headerDetails}>
        <div className={css.topLeft}>
          {/* <span className={css.visibility}>
            <RiGitRepositoryPrivateLine
              aria-label="private-lock-icon"
              className={css.icon}
            />
          </span> */}
          <DatabaseBreadcrumbs className={css.databaseBreadcrumbs} />
        </div>
        <div>
          <MobileHeaderSelector {...props} className={css.mobileSelector} />
        </div>
      </div>
      <DatabaseNav {...props} />
    </div>
  );
}
