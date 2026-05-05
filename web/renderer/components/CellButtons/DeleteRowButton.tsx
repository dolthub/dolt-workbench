import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
  useDeleteRowMutation,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { isUneditableDoltSystemTable } from "@lib/doltSystemTables";
import { refetchUpdateDatabaseQueriesCacheEvict } from "@lib/refetchQueries";
import { useApolloClient } from "@apollo/client";
import css from "./index.module.css";
import { toPKWhereClauses } from "./utils";

type Props = {
  row: RowForDataTableFragment;
  columns: ColumnForDataTableFragment[];
  refName?: string;
  onClose?: () => void;
};

export default function DeleteRowButton(props: Props): JSX.Element | null {
  const { setEditorString, setError } = useSqlEditorContext();
  const { params, columns } = useDataTableContext();
  const { tableName, schemaName, databaseName } = params;
  const refName = props.refName ?? params.refName;
  const client = useApolloClient();
  const { mutateFn: deleteRow } = useMutation({
    hook: useDeleteRowMutation,
  });

  if (!tableName || isUneditableDoltSystemTable(tableName)) return null;

  const onClick = async () => {
    const where = toPKWhereClauses(props.row, props.columns, columns);
    const res = await deleteRow({
      variables: { databaseName, refName, schemaName, tableName, where },
    });
    if (res.success && res.data?.deleteRow.queryString) {
      setEditorString(res.data.deleteRow.queryString);
      client
        .refetchQueries(refetchUpdateDatabaseQueriesCacheEvict)
        .catch(console.error);
    } else if (res.error) {
      setError(res.error);
    }
    props.onClose?.();
  };

  return (
    <HideForNoWritesWrapper params={params}>
      <Button.Link onClick={onClick} className={css.button}>
        Delete row
      </Button.Link>
    </HideForNoWritesWrapper>
  );
}
