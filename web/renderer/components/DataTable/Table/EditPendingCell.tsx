import { useDataTableContext } from "@contexts/dataTable";
import { Btn } from "@dolthub/react-components";
import { isNullValue } from "@dolthub/web-utils";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { BiText } from "@react-icons/all-files/bi/BiText";
import { VscCircleSlash } from "@react-icons/all-files/vsc/VscCircleSlash";
import Input from "@components/EditCellInput/Input";
import { getDefaultVal, getInputType } from "@components/EditCellInput";
import { useState } from "react";
import css from "./index.module.css";

type Props = {
  value: string;
  currentCol: ColumnForDataTableFragment;
  largerMarginRight?: boolean;
  cidx: number;
};

export default function EditPendingCell(props: Props) {
  const { params, pendingRow, setPendingRow } = useDataTableContext();
  const { tableName } = params;

  const isNull = isNullValue(props.value);
  const inputType = getInputType(props.currentCol.type);
  const val = getDefaultVal(props.value, inputType);
  const [newValue, setNewValue] = useState(val);
  const [showTextarea, setShowTextarea] = useState(false);

  if (!tableName) return null;

  const onEdit = (value: string) => {
    setNewValue(value);
    const newColumnValues = pendingRow?.columnValues.map((c, cidx) => {
      if (cidx === props.cidx) {
        return {
          ...c,
          displayValue: value,
        };
      }
      return c;
    });
    setPendingRow({ __typename: "Row", columnValues: newColumnValues || [] });
  };

  return (
    <>
      <Input
        isNull={isNull}
        newValue={newValue}
        setNewValue={onEdit}
        currColType={props.currentCol.type}
        showTextarea={showTextarea}
        inputType={inputType}
        largerMarginRight={props.largerMarginRight}
      />
      {inputType !== "textarea" && (
        <Btn
          onClick={() => setShowTextarea(!showTextarea)}
          className={css.textButton}
        >
          <span>
            <BiText />
            {showTextarea && <VscCircleSlash className={css.noTextIcon} />}
          </span>
        </Btn>
      )}
    </>
  );
}
