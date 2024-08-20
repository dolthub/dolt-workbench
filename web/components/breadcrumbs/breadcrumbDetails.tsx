import DatabasesDropdown from "@components/DatabasesDropdown";
import CommitLogLink from "@components/links/CommitLogLink";
import Link from "@components/links/Link";
import PullLink from "@components/links/PullLink";
import {
  DatabaseParams,
  DiffRangeParams,
  PullDiffParams,
  RefParams,
  SqlQueryParams,
  TableParams,
} from "@lib/params";
import { branches, commitLog, database, defaultDoc, releases } from "@lib/urls";
import { FiDatabase } from "@react-icons/all-files/fi/FiDatabase";
import css from "./index.module.css";
import { BreadcrumbDetails, BreadcrumbName, BreadcrumbType } from "./types";

const newBreadcrumb: BreadcrumbDetails = {
  child: <span>new</span>,
  name: BreadcrumbName.DBNew,
  type: BreadcrumbType.Text,
};

export function databaseBreadcrumbs(
  params: DatabaseParams,
  currentDBForPostgres?: string,
): BreadcrumbDetails[] {
  return [
    {
      child: (
        <span className={css.withIcon}>
          {!currentDBForPostgres && <FiDatabase />}
          <Link {...database(params)}>{params.databaseName}</Link>
        </span>
      ),
      name: BreadcrumbName.Database,
      type: BreadcrumbType.Link,
    },
    {
      child: <DatabasesDropdown params={params} />,
      name: BreadcrumbName.DatabaseDrop,
      type: BreadcrumbType.Button,
    },
  ];
}

export function queryBreadcrumbDetails(
  params: SqlQueryParams,
  currentDBForPostgres?: string,
): BreadcrumbDetails[] {
  return [
    ...databaseBreadcrumbs(params, currentDBForPostgres),
    {
      child: <span>query</span>,
      name: BreadcrumbName.DBQuery,
      type: BreadcrumbType.Text,
    },
  ];
}

export function branchesBreadcrumbsDetails(
  params: DatabaseParams,
  newBranch = false,
  currentDBForPostgres?: string,
): BreadcrumbDetails[] {
  if (newBranch) {
    return [
      ...databaseBreadcrumbs(params, currentDBForPostgres),
      {
        child: <Link {...branches(params)}>branches</Link>,
        name: BreadcrumbName.DBBranches,
        type: BreadcrumbType.Link,
      },
      newBreadcrumb,
    ];
  }
  return [
    ...databaseBreadcrumbs(params, currentDBForPostgres),
    {
      child: <span>branches</span>,
      name: BreadcrumbName.DBBranches,
      type: BreadcrumbType.Text,
    },
  ];
}

export function commitGraphBreadcrumbDetails(
  params: RefParams,
  currentDBForPostgres?: string,
): BreadcrumbDetails[] {
  return [
    ...databaseBreadcrumbs(params, currentDBForPostgres),
    {
      child: <Link {...commitLog(params)}>commits</Link>,
      name: BreadcrumbName.DBCommitLog,
      type: BreadcrumbType.Text,
    },
    {
      child: <span>graph</span>,
      name: BreadcrumbName.DBCommitGraph,
      type: BreadcrumbType.Text,
    },
  ];
}

export function commitLogBreadcrumbDetails(
  params: RefParams,
  currentDBForPostgres?: string,
): BreadcrumbDetails[] {
  const commits = <span>commits</span>;
  return [
    ...databaseBreadcrumbs(params, currentDBForPostgres),
    {
      child: commits,
      name: BreadcrumbName.DBCommitLog,
      type: BreadcrumbType.Text,
    },
  ];
}

export function tableBreadcrumbsDetails(
  params: TableParams,
  currentDBForPostgres?: string,
): BreadcrumbDetails[] {
  return [
    ...databaseBreadcrumbs(params, currentDBForPostgres),
    {
      child: <span>{params.tableName}</span>,
      name: BreadcrumbName.DBTable,
      type: BreadcrumbType.Text,
    },
  ];
}

export function releasesBreadcrumbsDetails(
  params: DatabaseParams,
  newRelease = false,
  currentDBForPostgres?: string,
): BreadcrumbDetails[] {
  if (newRelease) {
    return [
      ...databaseBreadcrumbs(params, currentDBForPostgres),
      {
        child: <Link {...releases(params)}>releases</Link>,
        name: BreadcrumbName.DBReleases,
        type: BreadcrumbType.Link,
      },
      newBreadcrumb,
    ];
  }
  return [
    ...databaseBreadcrumbs(params, currentDBForPostgres),
    {
      child: <span>releases</span>,
      name: BreadcrumbName.DBReleases,
      type: BreadcrumbType.Text,
    },
  ];
}
export function schemaBreadcrumbsDetails(
  params: DatabaseParams,
  currentDBForPostgres?: string,
): BreadcrumbDetails[] {
  return [
    ...databaseBreadcrumbs(params, currentDBForPostgres),
    {
      child: <span>schema</span>,
      name: BreadcrumbName.DBSchema,
      type: BreadcrumbType.Text,
    },
  ];
}

export function newDocBreadcrumbsDetails(
  params: RefParams,
  currentDBForPostgres?: string,
): BreadcrumbDetails[] {
  const docsLink = <Link {...defaultDoc(params)}>docs</Link>;
  return [
    ...databaseBreadcrumbs(params, currentDBForPostgres),
    {
      child: docsLink,
      name: BreadcrumbName.DBDocs,
      type: BreadcrumbType.Link,
    },
    newBreadcrumb,
  ];
}

export function docBreadcrumbsDetails(
  params: RefParams & { docName?: string },
  currentDBForPostgres?: string,
): BreadcrumbDetails[] {
  if (params.docName) {
    return [
      ...databaseBreadcrumbs(params, currentDBForPostgres),
      {
        child: <Link {...defaultDoc(params)}>docs</Link>,
        name: BreadcrumbName.DBDocs,
        type: BreadcrumbType.Link,
      },
      {
        child: <span>{params.docName}</span>,
        name: BreadcrumbName.DBDoc,
        type: BreadcrumbType.Text,
      },
    ];
  }
  return [
    ...databaseBreadcrumbs(params, currentDBForPostgres),
    {
      child: <span>docs</span>,
      name: BreadcrumbName.DBDocs,
      type: BreadcrumbType.Text,
    },
  ];
}

export function commitDiffBreadcrumbDetails(
  params: DiffRangeParams,
  currentDBForPostgres?: string,
): BreadcrumbDetails[] {
  const commitLogLink = <CommitLogLink params={params}>commits</CommitLogLink>;
  const commitDiffText = <span>{params.diffRange}</span>;
  return [
    ...databaseBreadcrumbs(params, currentDBForPostgres),
    {
      child: commitLogLink,
      name: BreadcrumbName.DBCommitLog,
      type: BreadcrumbType.Link,
    },
    {
      child: commitDiffText,
      name: BreadcrumbName.DBCommitDiff,
      type: BreadcrumbType.Text,
    },
  ];
}

export function pullsBreadcrumbs(
  params: DatabaseParams,
  currentDBForPostgres?: string,
): BreadcrumbDetails[] {
  return [
    ...databaseBreadcrumbs(params, currentDBForPostgres),
    {
      child: <span>pull requests</span>,
      name: BreadcrumbName.DBPulls,
      type: BreadcrumbType.Text,
    },
  ];
}

export function pullDiffBreadcrumbDetails(
  params: PullDiffParams,
  currentDBForPostgres?: string,
): BreadcrumbDetails[] {
  const pullLink = <PullLink params={params}>pull request</PullLink>;
  const pullDiffText = <span>diff</span>;
  const commitDiffText = (
    <span>
      {params.refName}...{params.fromBranchName}
    </span>
  );

  return [
    ...databaseBreadcrumbs(params, currentDBForPostgres),
    {
      child: pullLink,
      name: BreadcrumbName.DBPull,
      type: BreadcrumbType.Link,
    },
    {
      child: pullDiffText,
      name: BreadcrumbName.DBPullDiff,
      type: BreadcrumbType.Text,
    },
    {
      child: commitDiffText,
      name: BreadcrumbName.DBPullDiffRange,
      type: BreadcrumbType.Text,
    },
  ];
}
