import Link from "@components/links/Link";

import { TableParams } from "@lib/params";
import { editTable } from "@lib/urls";
import { AiOutlinePlus } from "@react-icons/all-files/ai/AiOutlinePlus";
import { AiOutlinePlusCircle } from "@react-icons/all-files/ai/AiOutlinePlusCircle";
import css from "./index.module.css";

export default function AddRowsButton(props: { params: TableParams }) {
  return (
    <div className={css.addMoreRows}>
      <AiOutlinePlusCircle className={css.plusButton} />
      <Link
        {...editTable(props.params)}
        data-cy={`db-tables-table-${props.params.tableName}-add-rows`}
      >
        <div className={css.expand}>
          <AiOutlinePlus />
          Add More Rows
        </div>
      </Link>
    </div>
  );
}
