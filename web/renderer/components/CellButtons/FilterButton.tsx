import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button } from "@dolthub/react-components";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
import css from "./index.module.css";
import { convertTimestamp } from "./utils";

type Props = {
  col?: ColumnForDataTableFragment;
  value: string;
  dataCy: string;
};

export default function FilterButton({ col, value, dataCy }: Props) {
  const { executeQuery } = useSqlEditorContext();
  const { params } = useDataTableContext();
  const { tableName } = params;
  const { addWhereClauseToSelect } = useSqlBuilder();

  if (!tableName) return null;

  const onClick = async () => {
    if (!col) {
      return;
    }
    // TODO: timestamp not working for postgres
    const val = col.type.toLowerCase().includes("timestamp")
      ? convertTimestamp(value)
      : value;
    const query = addWhereClauseToSelect(
      tableName,
      [{ col: col.name, val }],
      params.q,
    );
    await executeQuery({ ...params, query });
  };

  return (
    <Button.Link onClick={onClick} className={css.button} data-cy={dataCy}>
      Filter By Cell
    </Button.Link>
  );
}
