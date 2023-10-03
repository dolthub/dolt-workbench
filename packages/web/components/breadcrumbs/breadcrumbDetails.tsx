import { BreadcrumbDetails, BreadcrumbName, BreadcrumbType } from "./types";

// DATABASE

export function databaseBreadcrumbs(databaseName: string): BreadcrumbDetails[] {
  return [
    {
      child: <span>Database: {databaseName}</span>,
      name: BreadcrumbName.Database,
      type: BreadcrumbType.Text,
    },
  ];
}
