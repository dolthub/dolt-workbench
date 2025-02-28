import { useDataTableContext } from "@contexts/dataTable";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { isUneditableDoltSystemTable } from "@lib/doltSystemTables";
import {
  ColumnForDataTableFragment,
  useSqlSelectForSqlDataTableLazyQuery,
} from "@gen/graphql-types";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Button } from "@dolthub/react-components";
import { table } from "@lib/urls";
import { useRouter } from "next/router";
import { refetchUpdateDatabaseQueriesCacheEvict } from "@lib/refetchQueries";
import css from "./index.module.css";

export default function AddRowButton() {
  const { insertIntoTable } = useSqlBuilder();

  const [insertRow] = useSqlSelectForSqlDataTableLazyQuery();
  const router = useRouter();
  const { params, columns } = useDataTableContext();
  if (!columns) return null;
  const { tableName } = params;

  if (!tableName || isUneditableDoltSystemTable(tableName)) return null;

  const onClick = async () => {
    const emptyRow = generateEmptyRow(columns);
    const query = insertIntoTable(
      tableName,
      columns.map(c => c.name),
      emptyRow,
    );
    const res = await insertRow({
      variables: {
        databaseName: params.databaseName,
        refName: params.refName,
        queryString: query,
        schemaName: params.schemaName,
      },
      fetchPolicy: "no-cache",
    });
    await res.client
      .refetchQueries(refetchUpdateDatabaseQueriesCacheEvict)
      .catch(console.error);
    const { href, as } = table({ ...params, tableName });
    router.push(href, as).catch(console.error);
  };

  return (
    <HideForNoWritesWrapper params={params}>
      <Button.Link onClick={onClick} className={css.button}>
        Add row
      </Button.Link>
    </HideForNoWritesWrapper>
  );
}

function generateEmptyRow(columns: ColumnForDataTableFragment[]) {
  const emptyRow = columns.map(column => {
    const isNotNull =
      column.constraints?.some(constraint => constraint.notNull) || false;

    if (isNotNull) {
      // Handle non-null columns
      switch (column.type.toLowerCase()) {
        case "int":
        case "integer":
        case "bigint":
          return { type: column.type, value: 0 }; // Default integer value
        case "varchar":
        case "text":
        case "string":
          return { type: column.type, value: "" }; // Empty string
        case "datetime":
        case "timestamp":
          return { type: column.type, value: new Date().toISOString() }; // Current timestamp
        case "boolean":
          return { type: column.type, value: false }; // Default boolean value
        default:
          return { type: column.type, value: null }; // Fallback for unknown types
      }
    } else {
      return { type: "null", value: null };
    }
  });

  return emptyRow;
}
