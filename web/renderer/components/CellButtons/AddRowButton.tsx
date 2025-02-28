import { useDataTableContext } from "@contexts/dataTable";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { isUneditableDoltSystemTable } from "@lib/doltSystemTables";
import { useSqlSelectForSqlDataTableLazyQuery } from "@gen/graphql-types";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Button } from "@dolthub/react-components";
import { randomNum } from "@dolthub/web-utils";
import { table } from "@lib/urls";
import { useRouter } from "next/router";
import { refetchUpdateDatabaseQueriesCacheEvict } from "@lib/refetchQueries";
import css from "./index.module.css";

export default function AddRowButton() {
  const { params, columns } = useDataTableContext();
  const { tableName } = params;
  const { insertIntoTable } = useSqlBuilder();

  const [insertRow] = useSqlSelectForSqlDataTableLazyQuery();
  const router = useRouter();

  if (!tableName || isUneditableDoltSystemTable(tableName)) return null;

  const onClick = async () => {
    const query = insertIntoTable(
      tableName,
      columns?.map(c => c.name) ?? [],
      columns?.map(c => {
        return {
          type: c.type,
          value: c.isPrimaryKey ? randomNum(0, 10000) : `" "`,
        };
      }) ?? [],
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
