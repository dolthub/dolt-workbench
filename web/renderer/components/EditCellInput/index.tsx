import { toFilterValue, toPKWhereClauses } from "@components/CellButtons/utils";
import { useApolloClient } from "@apollo/client";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Btn, SmallLoader } from "@dolthub/react-components";
import { isNullValue } from "@dolthub/web-utils";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
  useUpdateRowMutation,
} from "@gen/graphql-types";
import useDataTableStack from "@hooks/useDataTableStack";
import useMutation from "@hooks/useMutation";
import { getBitDisplayValue } from "@lib/dataTable";
import { rewriteWhereColumn } from "@lib/dataTableParams";
import { refetchUpdateDatabaseQueriesCacheEvict } from "@lib/refetchQueries";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { BiText } from "react-icons/bi";
import { VscCircleSlash } from "react-icons/vsc";
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
  dataCy?: string;
};

export default function EditCellInput(props: Props) {
  const { setExecutedQuery, setExecutionError, setExecutionMessage } =
    useSqlEditorContext();
  const { params, columns } = useDataTableContext();
  const { tableName, schemaName, databaseName } = params;
  const refName = props.refName ?? params.refName;
  const { stack, update: updateStack } = useDataTableStack();
  const client = useApolloClient();
  const { mutateFn: updateRow, loading } = useMutation({
    hook: useUpdateRowMutation,
  });

  const isNull = isNullValue(props.value);
  const inputType = getInputType(props.currentCol.type);
  const val = getDefaultVal(props.value, inputType);
  const [newValue, setNewValue] = useState(val);
  const [showTextarea, setShowTextarea] = useState(false);

  if (!tableName) return null;

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (newValue === props.value) {
      props.cancelEditing();
      return;
    }

    const where = toPKWhereClauses(props.row, props.queryCols, columns);
    const set = [
      {
        column: props.currentCol.name,
        value: newValue,
        type: props.currentCol.type,
      },
    ];
    const res = await updateRow({
      variables: { databaseName, refName, schemaName, tableName, set, where },
    });
    if (res.success && res.data?.updateRow) {
      setExecutedQuery(res.data.updateRow.queryString, { isMutation: true });
      setExecutionMessage(res.data.updateRow.executionMessage);
      const nextWhere = rewriteWhereColumn(
        stack.where,
        props.currentCol.name,
        toFilterValue(props.currentCol.type, newValue),
      );
      if (nextWhere !== stack.where) {
        updateStack({ ...stack, where: nextWhere });
      }
      client
        .refetchQueries(refetchUpdateDatabaseQueriesCacheEvict)
        .catch(console.error);
      props.cancelEditing();
    } else if (res.error) {
      setExecutionError(res.error.message);
    }
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
        dataCy={`${props.dataCy}-value`}
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
          <Btn
            onClick={props.cancelEditing}
            title="cancel"
            data-cy={`${props.dataCy}-cancel`}
          >
            <AiOutlineClose />
          </Btn>
        </div>
      )}
    </form>
  );
}

export function getInputType(type: string): HTMLInputTypeAttribute {
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

export function getDefaultVal(value: string, inputType: string): string {
  if (isNullValue(value)) return "";
  if (inputType === "bit(1)") return getBitDisplayValue(value);
  return value;
}
