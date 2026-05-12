import { DropdownItem } from "@components/DatabaseOptionsDropdown";
import Link from "@components/links/Link";
import { SmallLoader } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  CommitDiffType,
  useDataTableQuery,
} from "@gen/graphql-types";
import { encodeCommitDiff } from "@lib/commitDiffUrl";
import { RequiredRefsParams } from "@lib/params";
import { query as queryRoute } from "@lib/urls";
import { AiOutlineConsoleSql } from "@react-icons/all-files/ai/AiOutlineConsoleSql";
import { HiddenColIndexes, isHiddenColumn } from "../utils";
import css from "./index.module.css";

type Props = {
  params: RequiredRefsParams & {
    refName: string;
    tableName: string;
  };
  hiddenColIndexes: HiddenColIndexes;
  type?: CommitDiffType;
};

type InnerProps = Props & {
  columns: ColumnForDataTableFragment[];
};

function Inner(props: InnerProps) {
  const excludedColumns = props.columns
    .filter((_, i) => isHiddenColumn(i, props.hiddenColIndexes))
    .map(c => c.name);
  const commitDiffParams = encodeCommitDiff({
    tableName: props.params.tableName,
    fromCommitId: props.params.fromRefName,
    toCommitId: props.params.toRefName,
    excludedColumns,
    type: props.type,
  });
  const baseRoute = queryRoute(props.params);
  const pushQuery = { ...commitDiffParams };

  return (
    <DropdownItem
      icon={<AiOutlineConsoleSql className={css.sqlIcon} />}
      data-cy="view-sql-link"
    >
      <Link
        href={{ pathname: baseRoute.hrefPathname(), query: pushQuery }}
        as={{ pathname: baseRoute.asPathname(), query: pushQuery }}
        className={css.sqlLink}
      >
        View SQL
      </Link>
    </DropdownItem>
  );
}

export default function ViewSqlLink(props: Props) {
  const tableRes = useDataTableQuery({
    variables: props.params,
  });

  if (tableRes.loading) {
    return <SmallLoader loaded={false} />;
  }

  if (!tableRes.data) {
    return null;
  }

  return <Inner {...props} columns={tableRes.data.table.columns} />;
}
