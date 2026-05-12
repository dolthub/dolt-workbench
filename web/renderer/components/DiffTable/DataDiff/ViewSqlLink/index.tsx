import { DropdownItem } from "@components/DatabaseOptionsDropdown";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button, SmallLoader } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  CommitDiffType,
  useDataTableQuery,
  useDoltCommitDiffLazyQuery,
} from "@gen/graphql-types";
import { RequiredRefsParams } from "@lib/params";
import { sqlQuery } from "@lib/urls";
import { AiOutlineConsoleSql } from "@react-icons/all-files/ai/AiOutlineConsoleSql";
import { useRouter } from "next/router";
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
  const router = useRouter();
  const { setError } = useSqlEditorContext();
  const [fetchDoltCommitDiff, { loading }] = useDoltCommitDiffLazyQuery();

  const onClick = async () => {
    const excludedColumns = props.columns
      .filter((_, i) => isHiddenColumn(i, props.hiddenColIndexes))
      .map(c => c.name);
    const res = await fetchDoltCommitDiff({
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
    if (res.error) {
      setError(res.error);
      return;
    }
    const sql = res.data?.doltCommitDiff;
    if (!sql) return;
    const { href, as } = sqlQuery({ ...props.params, q: sql });
    router.push(href, as).catch(console.error);
  };

  return (
    <DropdownItem
      icon={<AiOutlineConsoleSql className={css.sqlIcon} />}
      data-cy="view-sql-link"
    >
      <Button.Link onClick={onClick} disabled={loading} className={css.sqlLink}>
        View SQL
      </Button.Link>
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
