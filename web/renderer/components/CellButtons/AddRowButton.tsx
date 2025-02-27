import { useSqlEditorContext } from "@contexts/sqleditor";
import css from "./index.module.css";
import { useDataTableContext } from "@contexts/dataTable";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { isUneditableDoltSystemTable } from "@lib/doltSystemTables";
import { toPKColsMapQueryCols } from "./utils";
import { ColumnForDataTableFragment, RowForDataTableFragment } from "@gen/graphql-types";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Button } from "@dolthub/react-components";
import { ColumnValue } from "@hooks/useSqlBuilder/util";
import { randomNum } from "@dolthub/web-utils";

type Props = {
  row: RowForDataTableFragment;
  columns: ColumnForDataTableFragment[];
  refName?: string;
};
 
export default function AddRowButton(props: Props) {
    const { executeQuery, setEditorString } = useSqlEditorContext();
    const { params, columns } = useDataTableContext();
    const { tableName } = params;
    const { insertIntoTable } = useSqlBuilder();
  
    if (!tableName || isUneditableDoltSystemTable(tableName)) return null;
  
    const onClick = async () => {
      const query = insertIntoTable(
        tableName,
        columns?.map(c => c.name) ?? [],
        columns?.map(c =>{return {type:c.type,value:c.isPrimaryKey?randomNum(0,10000):`" "`}}) ?? []
      );
      setEditorString(query);
      await executeQuery({
        ...params,
        refName: props.refName ?? params.refName,
        query,
      });
    };
  
    return (
      <HideForNoWritesWrapper params={params}>
        <Button.Link onClick={onClick} className={css.button}>
          Add row
        </Button.Link>
      </HideForNoWritesWrapper>
    );
}