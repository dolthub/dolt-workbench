import { AiOutlineConsoleSql } from "@react-icons/all-files/ai/AiOutlineConsoleSql";
import {
  ColumnForDataTableFragment,
  useDataTableQuery,
} from "@gen/graphql-types";
import { DiffParams } from "@lib/params";
import { sqlQuery } from "@lib/urls";
import { DropdownItem } from "@components/DatabaseOptionsDropdown";
import Link from "@components/links/Link";
import SmallLoader from "@components/SmallLoader";
import { getDoltCommitDiffQuery } from "../DiffTableStats/utils";
import css from "./index.module.css";
import { HiddenColIndexes } from "./utils";

type Props = {
  params: Required<DiffParams> & {
    tableName: string;
  };
  hiddenColIndexes: HiddenColIndexes;
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
