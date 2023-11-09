import Button from "@components/Button";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { isDoltSystemTable } from "@lib/doltSystemTables";
import css from "./index.module.css";
import { dropColumnQuery } from "./queryHelpers";

type Props = {
  col: ColumnForDataTableFragment;
  refName?: string;
};

export default function DropColumnButton({ col, refName }: Props) {
  const { executeQuery, setEditorString } = useSqlEditorContext();
  const { params } = useDataTableContext();
  const { tableName } = params;

  if (!tableName || !col.sourceTable || isDoltSystemTable(tableName)) {
    return null;
  }

  const onClick = async () => {
    const query = dropColumnQuery(col.sourceTable ?? tableName, col.name);
    setEditorString(query);
    await executeQuery({
      ...params,
      refName: refName ?? params.refName,
      query,
    });
  };

  return (
    <HideForNoWritesWrapper params={params}>
      <div>
        <Button.Link onClick={onClick} className={css.button}>
          Drop column
        </Button.Link>
      </div>
    </HideForNoWritesWrapper>
  );
}
