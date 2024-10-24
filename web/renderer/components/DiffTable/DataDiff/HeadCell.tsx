import ChangeColumnStatusButton from "@components/CellButtons/ChangeColumnStatusButton";
import DropColumnButton from "@components/CellButtons/DropColumnButton";
import HideDiffColumnButton from "@components/CellButtons/HideDiffColumnButton";
import { CellDropdown } from "@dolthub/react-components";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { isLongContentType } from "@lib/dataTable";
import {
  CellStatusActionType,
  ColumnStatus,
  SetColumnStatus,
} from "@lib/tableTypes";
import { FiKey } from "@react-icons/all-files/fi/FiKey";
import cx from "classnames";
import { useState } from "react";
import css from "./index.module.css";
import { SetHiddenColIndexes, hideButton, hideColumn } from "./utils";

type Props = {
  col: ColumnForDataTableFragment;
  index: number;
  setHiddenColIndexes: SetHiddenColIndexes;
  hideCellButtons?: boolean;
  columnStatus: ColumnStatus;
  setColumnStatus: SetColumnStatus;
  refName: string;
};

export default function HeadCell(props: Props) {
  const [showDropdown, setShowDropdown] = useState(false);
  const showChangeStatusButtons = isLongContentType(props.col.type);
  return (
    <th
      className={cx(css.headCell, {
        [css.clicked]: showDropdown,
      })}
      data-cy={`db-data-table-column-${props.col.name}`}
    >
      {props.col.name}
      {props.col.isPrimaryKey && <FiKey className={css.key} />}

      <CellDropdown
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        buttonClassName={css.dropdownButton}
      >
        <HideDiffColumnButton
          onClick={() => hideColumn(props.index, props.setHiddenColIndexes)}
        />
        {!props.hideCellButtons && !props.col.isPrimaryKey && (
          <DropColumnButton col={props.col} refName={props.refName} />
        )}
        {showChangeStatusButtons &&
          Object.values(CellStatusActionType)
            .filter(c => !hideButton(c, props.columnStatus[props.index], true))
            .map(c => (
              <ChangeColumnStatusButton
                key={c}
                columnStatus={props.columnStatus}
                setColumnStatus={props.setColumnStatus}
                setShowDropdown={setShowDropdown}
                index={props.index}
                newStatus={c}
              />
            ))}
      </CellDropdown>
    </th>
  );
}
