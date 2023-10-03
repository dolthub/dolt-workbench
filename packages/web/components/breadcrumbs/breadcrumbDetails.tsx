import DatabasesDropdown from "@components/DatabasesDropdown";
import { DatabaseParams } from "@lib/params";
import { FiDatabase } from "@react-icons/all-files/fi/FiDatabase";
import css from "./index.module.css";
import { BreadcrumbDetails, BreadcrumbName, BreadcrumbType } from "./types";

// DATABASE

export function databaseBreadcrumbs(
  params: DatabaseParams,
): BreadcrumbDetails[] {
  return [
    {
      child: (
        <span className={css.withIcon}>
          <FiDatabase /> {params.databaseName}
        </span>
      ),
      name: BreadcrumbName.Database,
      type: BreadcrumbType.Text,
    },
    {
      child: <DatabasesDropdown params={params} />,
      name: BreadcrumbName.DatabaseDrop,
      type: BreadcrumbType.Button,
    },
  ];
}
