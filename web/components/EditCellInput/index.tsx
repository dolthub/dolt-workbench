import Btn from "@components/Btn";
import { toPKColsMapQueryCols } from "@components/CellButtons/queryHelpers";
import SmallLoader from "@components/SmallLoader";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { getBitDisplayValue } from "@lib/dataTable";
import { isNullValue } from "@lib/null";
import { AiOutlineCheck } from "@react-icons/all-files/ai/AiOutlineCheck";
import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";
import { BiText } from "@react-icons/all-files/bi/BiText";
import { VscCircleSlash } from "@react-icons/all-files/vsc/VscCircleSlash";
import cx from "classnames";
import { HTMLInputTypeAttribute, SyntheticEvent, useState } from "react";
import Input from "./Input";
import css from "./index.module.css";

type Props = {
  value: string;
  currentCol: ColumnForDataTableFragment;
  queryCols: ColumnForDataTableFragment[];
  row: RowForDataTableFragment;
  cancelEditing: () => void;
  largerMarginRight?: boolean;
  refName?: string;
};

export default function EditCellInput(props: Props) {
  const { executeQuery, loading, setEditorString } = useSqlEditorContext();
  const { params, columns } = useDataTableContext();
  const { tableName } = params;

  const isNull = isNullValue(props.value);
  const inputType = getInputType(props.currentCol.type);
  const val = getDefaultVal(props.value, inputType);
  const [newValue, setNewValue] = useState(val);
  const [showTextarea, setShowTextarea] = useState(false);
  const { updateTableQuery } = useSqlBuilder();

  if (!tableName) return null;

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (newValue === props.value) {
      props.cancelEditing();
      return;
    }

    const query = updateTableQuery(
      tableName,
      props.currentCol.name,
      newValue,
      toPKColsMapQueryCols(props.row, props.queryCols, columns),
    );
    setEditorString(query);
    await executeQuery({
      ...params,
      refName: props.refName ?? params.refName,
      query,
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <Input
        isNull={isNull}
        newValue={newValue}
        setNewValue={setNewValue}
        currColType={props.currentCol.type}
        showTextarea={showTextarea}
        inputType={inputType}
        largerMarginRight={props.largerMarginRight}
      />
      {loading ? (
        <div className={css.formLoader}>
          <SmallLoader loaded={false} />
        </div>
      ) : (
        <div
          className={cx(css.editButtons, {
            [css.right]: !(props.largerMarginRight && inputType !== "textarea"),
            [css.altRight]: props.largerMarginRight && inputType !== "textarea",
          })}
        >
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
          <Btn type="submit" title="submit">
            <AiOutlineCheck />
          </Btn>
          <Btn onClick={props.cancelEditing} title="cancel">
            <AiOutlineClose />
          </Btn>
        </div>
      )}
    </form>
  );
}

function getInputType(type: string): HTMLInputTypeAttribute {
  const lower = type.toLowerCase();
  if (lower.includes("int") || lower === "year") return "number";
  if (lower === "datetime" || lower === "timestamp") return "datetime";
  if (lower === "date") return "date";
  if (lower.includes("time")) return "time";
  if (
    lower.includes("text") ||
    lower.includes("char") ||
    lower.includes("blob")
  ) {
    return "textarea";
  }
  if (lower.includes("enum")) return "dropdown";
  if (lower.includes("json")) return "json";
  if (lower.includes("bit(1)")) return "bit(1)";
  return "text";
}

function getDefaultVal(value: string, inputType: string): string {
  if (isNullValue(value)) return "";
  if (inputType === "bit(1)") return getBitDisplayValue(value);
  return value;
}
