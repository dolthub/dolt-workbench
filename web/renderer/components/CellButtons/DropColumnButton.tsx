import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { useApolloClient } from "@apollo/client";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  useDropColumnMutation,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { isDoltSystemTable } from "@lib/doltSystemTables";
import { refetchUpdateDatabaseQueriesCacheEvict } from "@lib/refetchQueries";
import css from "./index.module.css";

type Props = {
  col: ColumnForDataTableFragment;
  refName?: string;
};

export default function DropColumnButton({ col, refName }: Props) {
  const { setEditorString, setError, setExecutionMessage } =
    useSqlEditorContext();
  const { params } = useDataTableContext();
  const { tableName, schemaName, databaseName } = params;
  const effectiveRefName = refName ?? params.refName;
  const client = useApolloClient();
  const { mutateFn: dropColumn } = useMutation({ hook: useDropColumnMutation });

  if (!tableName || !col.sourceTable || isDoltSystemTable(tableName)) {
    return null;
  }

  const onClick = async () => {
    const res = await dropColumn({
      variables: {
        databaseName,
        refName: effectiveRefName,
        schemaName,
        tableName: col.sourceTable ?? tableName,
        columnName: col.name,
      },
    });
    if (res.success && res.data?.dropColumn) {
      setEditorString(res.data.dropColumn.queryString);
      setExecutionMessage(res.data.dropColumn.executionMessage);
      client
        .refetchQueries(refetchUpdateDatabaseQueriesCacheEvict)
        .catch(console.error);
    } else if (res.error) {
      setError(res.error);
    }
  };

  return (
    <HideForNoWritesWrapper params={params}>
      <Button.Link onClick={onClick} className={css.button}>
        Drop column
      </Button.Link>
    </HideForNoWritesWrapper>
  );
}
