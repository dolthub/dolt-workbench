import { ReactElement } from "react";

export enum BreadcrumbName {
  Database = "database",
  DatabasePostgres = "database-postgres",
  DatabaseDrop = "database-dropdown",
  DBBranches = "db-branches",
  DBPulls = "db-pulls",
  DBPull = "db-pull",
  DBDocs = "db-issues",
  DBDoc = "db-doc",
  DBReleases = "db-releases",
  DBTable = "db-table",
  DBCommitLog = "db-commit-log",
  DBCommitDiff = "db-commit-diff",
  DBPullConflicts = "db-pull-conflicts",
  DBPullDiff = "db-pull-diff",
  DBPullDiffRange = "db-pull-diff-range",
  DBQueries = "db-queries",
  DBQuery = "db-query",
  DBQueryStatement = "db-query-statement",
  DBSchema = "db-schema",
  DBCommitGraph = "db-commit-graph",
  DBNew = "db-new",
  DBRemote = "db-remote",
}

export enum BreadcrumbType {
  Link = "link",
  Text = "text",
  Button = "button",
}

export type BreadcrumbProps = {
  key: string;
  ["data-cy"]: string;
  ["aria-label"]: string;
};

export type BreadcrumbDetails = {
  child: ReactElement;
  name: BreadcrumbName;
  type: BreadcrumbType;
};
