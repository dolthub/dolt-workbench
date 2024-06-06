import { DropdownItem } from "@components/DatabaseOptionsDropdown";
import Link from "@components/links/Link";
import { SmallLoader } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  CommitDiffType,
  useDataTableQuery,
} from "@gen/graphql-types";
import { useGetDoltCommitDiffQuery } from "@hooks/useDoltQueryBuilder/useGetDoltCommitDiffQuery";
import { RequiredRefsParams } from "@lib/params";
import { sqlQuery } from "@lib/urls";
import { AiOutlineConsoleSql } from "@react-icons/all-files/ai/AiOutlineConsoleSql";
import { HiddenColIndexes } from "../utils";
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
  const { generateQuery } = useGetDoltCommitDiffQuery(props);

  return (
    <DropdownItem
      icon={<AiOutlineConsoleSql className={css.sqlIcon} />}
      data-cy="view-sql-link"
    >
      <Link
        {...sqlQuery({
          ...props.params,
          q: generateQuery(),
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
