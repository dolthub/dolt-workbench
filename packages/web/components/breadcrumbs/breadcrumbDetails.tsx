import { FiDatabase } from "@react-icons/all-files/fi/FiDatabase";
import css from "./index.module.css";
import { BreadcrumbDetails, BreadcrumbName, BreadcrumbType } from "./types";

// DATABASE

export function databaseBreadcrumbs(databaseName: string): BreadcrumbDetails[] {
  return [
    {
      child: (
        <span className={css.withIcon}>
          <FiDatabase /> {databaseName}
        </span>
      ),
      name: BreadcrumbName.Database,
      type: BreadcrumbType.Text,
    },
  ];
}
