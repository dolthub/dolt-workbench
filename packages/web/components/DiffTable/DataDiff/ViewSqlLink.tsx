import { DropdownItem } from "@components/DatabaseOptionsDropdown";
import SmallLoader from "@components/SmallLoader";
import Link from "@components/links/Link";
import {
  ColumnForDataTableFragment,
  useDataTableQuery,
} from "@gen/graphql-types";
import { RequiredRefsParams } from "@lib/params";
import { sqlQuery } from "@lib/urls";
import { AiOutlineConsoleSql } from "@react-icons/all-files/ai/AiOutlineConsoleSql";
import { getDoltCommitDiffQuery } from "../DiffTableStats/utils";
import css from "./index.module.css";
import { HiddenColIndexes } from "./utils";

type Props = {
  params: RequiredRefsParams & {
    refName: string;
    tableName: string;
  };
  hiddenColIndexes: HiddenColIndexes;
  forPull?: boolean;
};

type InnerProps = Props & {
  columns: ColumnForDataTableFragment[];
};

function Inner(props: InnerProps) {
  return (
    <DropdownItem
      icon={<AiOutlineConsoleSql className={css.sqlIcon} />}
      data-cy="view-sql-link"
    >
      <Link
        {...sqlQuery({
          ...props.params,
          q: getDoltCommitDiffQuery(props),
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
