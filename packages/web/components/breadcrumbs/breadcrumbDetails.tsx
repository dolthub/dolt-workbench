import DatabasesDropdown from "@components/DatabasesDropdown";
import CommitLogLink from "@components/links/CommitLogLink";
import Link from "@components/links/Link";
import {
  DatabaseParams,
  DiffRangeParams,
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
): BreadcrumbDetails[] {
  return [
    {
      child: (
        <span className={css.withIcon}>
          <FiDatabase />{" "}
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
): BreadcrumbDetails[] {
  return [
    ...databaseBreadcrumbs(params),
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
): BreadcrumbDetails[] {
  if (newBranch) {
    return [
      ...databaseBreadcrumbs(params),
      {
        child: <Link {...branches(params)}>branches</Link>,
        name: BreadcrumbName.DBBranches,
        type: BreadcrumbType.Link,
      },
      newBreadcrumb,
    ];
  }
  return [
    ...databaseBreadcrumbs(params),
    {
      child: <span>branches</span>,
      name: BreadcrumbName.DBBranches,
      type: BreadcrumbType.Text,
    },
  ];
}

export function commitGraphBreadcrumbDetails(
  params: RefParams,
): BreadcrumbDetails[] {
  return [
    ...databaseBreadcrumbs(params),
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
): BreadcrumbDetails[] {
  const commits = <span>commits</span>;
  return [
    ...databaseBreadcrumbs(params),
    {
      child: commits,
      name: BreadcrumbName.DBCommitLog,
      type: BreadcrumbType.Text,
    },
  ];
}

export function tableBreadcrumbsDetails(
  params: TableParams,
): BreadcrumbDetails[] {
  return [
    ...databaseBreadcrumbs(params),
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
): BreadcrumbDetails[] {
  if (newRelease) {
    return [
      ...databaseBreadcrumbs(params),
      {
        child: <Link {...releases(params)}>releases</Link>,
        name: BreadcrumbName.DBReleases,
        type: BreadcrumbType.Link,
      },
      newBreadcrumb,
    ];
  }
  return [
    ...databaseBreadcrumbs(params),
    {
      child: <span>releases</span>,
      name: BreadcrumbName.DBReleases,
      type: BreadcrumbType.Text,
    },
  ];
}
export function schemaBreadcrumbsDetails(
  params: DatabaseParams,
): BreadcrumbDetails[] {
  return [
    ...databaseBreadcrumbs(params),
    {
      child: <span>schema</span>,
      name: BreadcrumbName.DBSchema,
      type: BreadcrumbType.Text,
    },
  ];
}

export function newDocBreadcrumbsDetails(
  params: RefParams,
): BreadcrumbDetails[] {
  const docsLink = <Link {...defaultDoc(params)}>docs</Link>;
  return [
    ...databaseBreadcrumbs(params),
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
): BreadcrumbDetails[] {
  if (params.docName) {
    return [
      ...databaseBreadcrumbs(params),
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
    ...databaseBreadcrumbs(params),
    {
      child: <span>docs</span>,
      name: BreadcrumbName.DBDocs,
      type: BreadcrumbType.Text,
    },
  ];
}

export function commitDiffBreadcrumbDetails(
  params: DiffRangeParams,
): BreadcrumbDetails[] {
  const commitLogLink = <CommitLogLink params={params}>commits</CommitLogLink>;
  const commitDiffText = <span>{params.diffRange}</span>;
  return [
    ...databaseBreadcrumbs(params),
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

export function pullsBreadcrumbs(params: DatabaseParams): BreadcrumbDetails[] {
  return [
    ...databaseBreadcrumbs(params),
    {
      child: <span>pull requests</span>,
      name: BreadcrumbName.DBPulls,
      type: BreadcrumbType.Text,
    },
  ];
}
