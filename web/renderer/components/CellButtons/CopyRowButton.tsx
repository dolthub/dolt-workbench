import { serializeCellValue } from "@components/pageComponents/FileUploadPage/Steps/Upload/EditableTable/TableGrid/utils";
import { Button } from "@dolthub/react-components";
import { useDelay } from "@dolthub/react-hooks";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { getBitDisplayValue } from "@lib/dataTable";
import CopyToClipboard from "react-copy-to-clipboard";
import css from "./index.module.css";

type Props = {
  row: RowForDataTableFragment;
  columns: ColumnForDataTableFragment[];
  disabled?: boolean;
};

export default function CopyRowButton({
  row,
  columns,
  disabled,
}: Props): JSX.Element {
  const success = useDelay();
  const copyVal = getCopyVal(row, columns);
  return (
    <CopyToClipboard onCopy={success.start} text={copyVal}>
      <Button.Link
        className={css.button}
        data-cy="copy-row-button"
        disabled={disabled}
      >
        {success.active ? "Copied" : "Copy row"}
      </Button.Link>
    </CopyToClipboard>
  );
}

function getCopyVal(
  row: RowForDataTableFragment,
  columns: ColumnForDataTableFragment[],
): string {
  return row.columnValues
    .map((c, cidx) => {
      const colType = columns[cidx].type;
      const value = c.displayValue;
      return colType === "bit(1)"
        ? getBitDisplayValue(value)
        : serializeCellValue(value);
    })
    .join(",");
}
