import { DropdownItem } from "@components/DatabaseOptionsDropdown";
import Link from "@components/links/Link";
import { ErrorMsg, SmallLoader } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  CommitDiffType,
  useDataTableQuery,
  useDoltCommitDiffQuery,
} from "@gen/graphql-types";
import { RequiredRefsParams } from "@lib/params";
import { sqlQuery } from "@lib/urls";
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
  const { data, loading, error } = useDoltCommitDiffQuery({
    variables: {
      databaseName: props.params.databaseName,
      refName: props.params.refName,
      tableName: props.params.tableName,
      fromCommitId: props.params.fromRefName,
      toCommitId: props.params.toRefName,
      excludedColumns,
      type: props.type,
    },
  });

  if (error) {
    return <ErrorMsg err={error} />;
  }
  if (loading || !data?.doltCommitDiff) {
    return <SmallLoader loaded={false} />;
  }

  return (
    <DropdownItem
      icon={<AiOutlineConsoleSql className={css.sqlIcon} />}
      data-cy="view-sql-link"
    >
      <Link
        {...sqlQuery({
          ...props.params,
          q: data.doltCommitDiff,
        })}
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
