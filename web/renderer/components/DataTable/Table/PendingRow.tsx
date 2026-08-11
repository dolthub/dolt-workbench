import { useApolloClient } from "@apollo/client";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  ColumnValueInput,
  RowForDataTableFragment,
  useInsertRowMutation,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { refetchUpdateDatabaseQueriesCacheEvict } from "@lib/refetchQueries";
import cx from "classnames";
import { IoMdClose } from "react-icons/io";
import PendingCell from "./PendingCell";
import css from "./index.module.css";

type Props = {
  row: RowForDataTableFragment;
  isMobile?: boolean;
  columns: ColumnForDataTableFragment[];
};

export default function PendingRow(props: Props) {
  const { setPendingRow, params, columns } = useDataTableContext();
  const { setExecutedQuery, setExecutionError, setExecutionMessage } =
    useSqlEditorContext();
  const client = useApolloClient();
  const { mutateFn: insertRow } = useMutation({ hook: useInsertRowMutation });

  const { tableName, schemaName, databaseName, refName } = params;
  if (!tableName) return null;

  const onDelete = () => {
    setPendingRow(undefined);
  };

  const onSave = async () => {
    const values: ColumnValueInput[] =
      columns?.map((c, idx) => {
        return {
          column: c.name,
          value: props.row.columnValues[idx]?.displayValue ?? null,
          type: c.type,
        };
      }) ?? [];

    const res = await insertRow({
      variables: { databaseName, refName, schemaName, tableName, values },
    });
    if (res.success && res.data?.insertRow) {
      setExecutedQuery(res.data.insertRow.queryString, { isMutation: true });
      setExecutionMessage(res.data.insertRow.executionMessage);
      client
        .refetchQueries(refetchUpdateDatabaseQueriesCacheEvict)
        .catch(console.error);
      setPendingRow(undefined);
    } else if (res.error) {
      setExecutionError(res.error.message);
    }
  };

  return (
    <tr className={cx(css.row, css.pendingRow)}>
      <td className={css.buttons}>
        <IoMdClose className={css.deleteRow} onClick={onDelete} />
      </td>
      {props.row.columnValues.map((c, cidx) => (
        // eslint-disable-next-line react/jsx-key
        <PendingCell {...props} cell={c} cidx={cidx} />
      ))}
      <td className={css.buttons}>
        <Button onClick={onSave} size="small" className={css.submitButton}>
          submit
        </Button>
        <IoMdClose className={css.deleteRow} onClick={onDelete} />
      </td>
    </tr>
  );
}
