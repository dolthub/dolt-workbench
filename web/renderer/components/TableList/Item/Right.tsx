import Link from "@components/links/Link";
import { Btn } from "@dolthub/react-components";
import { TableParams } from "@lib/params";
import { editTable, table as tableUrl } from "@lib/urls";
import { BiPencil } from "@react-icons/all-files/bi/BiPencil";
import { MdPlayCircleOutline } from "@react-icons/all-files/md/MdPlayCircleOutline";
import { useRouter } from "next/router";
import css from "./index.module.css";

export default function Right(props: { params: TableParams; active: boolean }) {
  const router = useRouter();

  const editing = !!router.query.edit;
  const status = editing ? "editing" : "viewing";

  return (
    <span className={css.right}>
      {(!props.active || !editing) && (
        <Link
          {...editTable(props.params)}
          data-cy={`db-tables-table-${props.params.tableName}-edit`}
        >
          <Btn className={css.buttonIcon}>
            <BiPencil />
          </Btn>
        </Link>
      )}

      {(!props.active || editing) && (
        <Link
          {...tableUrl(props.params)}
          data-cy={`db-tables-table-${props.params.tableName}-play`}
        >
          <Btn className={css.buttonIcon}>
            <MdPlayCircleOutline />
          </Btn>
        </Link>
      )}

      {props.active && (
        <span className={css.tableStatus} data-cy={`db-tables-table-${status}`}>
          {editing ? "editing" : "viewing"}
        </span>
      )}
    </span>
  );
}
