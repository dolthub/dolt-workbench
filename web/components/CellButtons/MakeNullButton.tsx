import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { isUneditableDoltSystemTable } from "@lib/doltSystemTables";
import css from "./index.module.css";
import { toPKColsMapQueryCols } from "./queryHelpers";
import { pksAreShowing } from "./utils";

type Props = {
  currCol: ColumnForDataTableFragment;
  queryCols: ColumnForDataTableFragment[];
  row: RowForDataTableFragment;
  setQuery?: (s: string) => void;
  isNull: boolean;
  refName?: string;
};

export default function MakeNullButton(props: Props): JSX.Element | null {
  const { executeQuery, setEditorString } = useSqlEditorContext();
  const { params, columns } = useDataTableContext();
  const { tableName } = params;
  const notNullConstraint = !!props.currCol.constraints?.some(
    con => con.notNull,
  );
  const { updateTableMakeNullQuery } = useSqlBuilder();

  if (
    !tableName ||
    isUneditableDoltSystemTable(tableName) ||
    !pksAreShowing(props.queryCols, columns)
  ) {
    return null;
  }

  const onClick = async () => {
    const query = updateTableMakeNullQuery(
      tableName,
      props.currCol.name,
      toPKColsMapQueryCols(props.row, props.queryCols, columns),
    );
    if (props.setQuery) {
      props.setQuery(query);
    }
    setEditorString(query);
    await executeQuery({
      ...params,
      refName: props.refName ?? params.refName,
      query,
    });
  };

  return (
    <HideForNoWritesWrapper params={params}>
      <div>
        <Button.Link
          onClick={onClick}
          className={css.button}
          disabled={notNullConstraint || props.isNull}
        >
          Make NULL
        </Button.Link>
      </div>
    </HideForNoWritesWrapper>
  );
}
