import Btn from "@components/Btn";
import Link from "@components/links/Link";
import { Maybe } from "@gen/graphql-types";
import { useReactiveWidth } from "@hooks/useReactiveSize";
import { RefParams, TableParams } from "@lib/params";
import { editTable, table as tableUrl } from "@lib/urls";
import { BiPencil } from "@react-icons/all-files/bi/BiPencil";
import { FaChevronDown } from "@react-icons/all-files/fa/FaChevronDown";
import { FaChevronUp } from "@react-icons/all-files/fa/FaChevronUp";
import { MdPlayCircleOutline } from "@react-icons/all-files/md/MdPlayCircleOutline";
import cx from "classnames";
import { useRouter } from "next/router";
import { useState } from "react";
import ColumnList from "./ColumnList";
import MobileTableListItem from "./MobileTableListItem";
import css from "./index.module.css";

type Props = {
  tableName: string;
  params: RefParams & { tableName?: Maybe<string> };
};

export default function Item({ tableName, params }: Props) {
  const active = tableName === params.tableName;
  const [expanded, setExpanded] = useState(active);
  const { isMobile } = useReactiveWidth(null, 1024);

  return isMobile ? (
    <MobileTableListItem tableName={tableName} params={params} />
  ) : (
    <li
      className={cx(css.item, {
        [css.active]: active,
        [css.isExpanded]: expanded,
      })}
      data-cy={`db-tables-table-${tableName}`}
      id={tableName}
    >
      <div className={css.table}>
        <span>
          <Btn onClick={() => setExpanded(!expanded)} className={css.tableName}>
            {expanded ? <FaChevronUp /> : <FaChevronDown />}
            {tableName}
          </Btn>
        </span>

        <Right params={{ ...params, tableName }} active={active} />
      </div>
      {expanded && <ColumnList params={{ ...params, tableName }} />}
    </li>
  );
}

function Right(props: { params: TableParams; active: boolean }) {
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
          {editing ? "Editing" : "Viewing"}
        </span>
      )}
    </span>
  );
}
