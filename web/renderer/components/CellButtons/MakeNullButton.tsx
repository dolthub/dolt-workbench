import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { useApolloClient } from "@apollo/client";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
  useUpdateRowMutation,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { isUneditableDoltSystemTable } from "@lib/doltSystemTables";
import { refetchUpdateDatabaseQueriesCacheEvict } from "@lib/refetchQueries";
import css from "./index.module.css";
import { pksAreShowing, toPKWhereClauses } from "./utils";

type Props = {
  currCol: ColumnForDataTableFragment;
  queryCols: ColumnForDataTableFragment[];
  row: RowForDataTableFragment;
  isNull: boolean;
  refName?: string;
};

export default function MakeNullButton(props: Props): JSX.Element | null {
  const { setExecutedQuery, setExecutionError, setExecutionMessage } =
    useSqlEditorContext();
  const { params, columns } = useDataTableContext();
  const { tableName, schemaName, databaseName } = params;
  const refName = props.refName ?? params.refName;
  const client = useApolloClient();
  const { mutateFn: updateRow } = useMutation({ hook: useUpdateRowMutation });
  const notNullConstraint = !!props.currCol.constraints?.some(
    con => con.notNull,
  );

  if (
    !tableName ||
    isUneditableDoltSystemTable(tableName) ||
    !pksAreShowing(props.queryCols, columns)
  ) {
    return null;
  }

  const onClick = async () => {
    const where = toPKWhereClauses(props.row, props.queryCols, columns);
    const set = [
      { column: props.currCol.name, value: null, type: props.currCol.type },
    ];
    const res = await updateRow({
      variables: { databaseName, refName, schemaName, tableName, set, where },
    });
    if (res.success && res.data?.updateRow) {
      setExecutedQuery(res.data.updateRow.queryString, { isMutation: true });
      setExecutionMessage(res.data.updateRow.executionMessage);
      client
        .refetchQueries(refetchUpdateDatabaseQueriesCacheEvict)
        .catch(console.error);
    } else if (res.error) {
      setExecutionError(res.error.message);
    }
  };

  return (
    <HideForNoWritesWrapper params={params}>
      <Button.Link
        onClick={onClick}
        className={css.button}
        disabled={notNullConstraint || props.isNull}
      >
        Make NULL
      </Button.Link>
    </HideForNoWritesWrapper>
  );
}
