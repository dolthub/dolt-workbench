import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { useDataTableContext } from "@contexts/dataTable";
import { Button } from "@dolthub/react-components";
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
    <HideForNoWritesWrapper params={params}>
      <Button.Link
        onClick={() => props.setEditing(true)}
        className={css.button}
      >
        Edit Cell Value
      </Button.Link>
    </HideForNoWritesWrapper>
  );
}
