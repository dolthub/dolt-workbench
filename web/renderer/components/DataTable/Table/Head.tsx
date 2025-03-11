import { useDataTableContext } from "@contexts/dataTable";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { AiOutlinePlusCircle } from "@react-icons/all-files/ai/AiOutlinePlusCircle";
import { ColumnStatus, SetColumnStatus } from "@lib/tableTypes";
import { getTableColsFromQueryCols } from "@components/CellButtons/utils";
import useSqlParser from "@hooks/useSqlParser";
import { Btn } from "@dolthub/react-components";
import HeadCell from "./HeadCell";
import css from "./index.module.css";

type Props = {
  columns: ColumnForDataTableFragment[];
  isMobile?: boolean;
  columnStatus: ColumnStatus;
  setColumnStatus: SetColumnStatus;
};

export default function Head(props: Props) {
  const { columns, onAddEmptyRow, pendingRow, params } = useDataTableContext();
  const cols = getTableColsFromQueryCols(props.columns, columns);
  const { isMutation } = useSqlParser();

  return (
    <thead>
      <tr
        data-cy={`${
          props.isMobile ? "mobile-" : "desktop-"
        }db-data-table-columns`}
      >
        <th>
          {!pendingRow?.columnValues.length && !isMutation(params.q) && (
            <Btn
              onClick={() => {
                onAddEmptyRow();
              }}
              disabled={!!pendingRow?.columnValues.length}
              className={css.addRowBtn}
            >
              <AiOutlinePlusCircle />
            </Btn>
          )}
        </th>
        {cols.map((c, i) => (
          <HeadCell {...props} key={c.name} col={c} idx={i} />
        ))}
      </tr>
    </thead>
  );
}
