import { useDataTableContext } from "@contexts/dataTable";
import { Btn } from "@dolthub/react-components";
import { isNullValue } from "@dolthub/web-utils";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { getBitDisplayValue } from "@lib/dataTable";
import { AiOutlineCheck } from "@react-icons/all-files/ai/AiOutlineCheck";
import { BiText } from "@react-icons/all-files/bi/BiText";
import { VscCircleSlash } from "@react-icons/all-files/vsc/VscCircleSlash";
import Input from "@components/EditCellInput/Input";
import cx from "classnames";
import { HTMLInputTypeAttribute, useState } from "react";
import css from "./index.module.css";

type Props = {
  value: string;
  currentCol: ColumnForDataTableFragment;
  cancelEditing: () => void;
  largerMarginRight?: boolean;
};

export default function EditPendingCell(props: Props) {
  const { params } = useDataTableContext();
  const { tableName } = params;

  const isNull = isNullValue(props.value);
  const inputType = getInputType(props.currentCol.type);
  const val = getDefaultVal(props.value, inputType);
  const [newValue, setNewValue] = useState(val);
  const [showTextarea, setShowTextarea] = useState(false);

  if (!tableName) return null;

  return (
    <>
      <Input
        isNull={isNull}
        newValue={newValue}
        setNewValue={setNewValue}
        currColType={props.currentCol.type}
        showTextarea={showTextarea}
        inputType={inputType}
        largerMarginRight={props.largerMarginRight}
      />

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

        <Btn onClick={props.cancelEditing} title="cancel">
          <AiOutlineCheck />
        </Btn>
      </div>
    </>
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
