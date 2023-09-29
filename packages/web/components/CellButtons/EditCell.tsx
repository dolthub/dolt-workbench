import Button from "@components/Button";
import { useDataTableContext } from "@contexts/dataTable";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { isUneditableDoltSystemTable } from "@lib/doltSystemTables";
import css from "./index.module.css";
import { pksAreShowing } from "./utils";

type Props = {
  setEditing: (e: boolean) => void;
  queryCols: ColumnForDataTableFragment[];
};

export default function EditCell(props: Props) {
  const { params, columns } = useDataTableContext();

  if (
    isUneditableDoltSystemTable(params.tableName) ||
    !pksAreShowing(props.queryCols, columns)
  ) {
    return null;
  }

  return (
    <div>
      <Button.Link
        onClick={() => props.setEditing(true)}
        className={css.button}
      >
        Edit Cell Value
      </Button.Link>
    </div>
  );
}
