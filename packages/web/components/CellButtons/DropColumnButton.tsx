import Button from "@components/Button";
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

  if (!tableName || isDoltSystemTable(tableName)) return null;

  const onClick = async () => {
    const query = dropColumnQuery(tableName, col.name);
    setEditorString(query);
    await executeQuery({
      ...params,
      refName: refName ?? params.refName,
      query,
    });
  };

  return (
    <div>
      <Button.Link onClick={onClick} className={css.button}>
        Drop column
      </Button.Link>
    </div>
  );
}
