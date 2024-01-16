import Btn from "@components/Btn";
import Link from "@components/links/Link";
import { excerpt } from "@dolthub/web-utils";
import { Maybe } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { table } from "@lib/urls";
import { FaChevronDown } from "@react-icons/all-files/fa/FaChevronDown";
import { FaChevronUp } from "@react-icons/all-files/fa/FaChevronUp";
import cx from "classnames";
import { useState } from "react";
import ColumnList from "../ColumnList";
import Right from "./Right";
import css from "./index.module.css";

type Props = {
  tableName: string;
  params: RefParams & { tableName?: Maybe<string> };
};

export default function Item({ tableName, params }: Props) {
  const active = tableName === params.tableName;
  const [expanded, setExpanded] = useState(active);

  return (
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
            {excerpt(tableName, 33)}
          </Btn>
          <Link
            {...table({ ...params, tableName })}
            className={css.mobileTableLink}
          >
            {tableName}
          </Link>
        </span>

        <Right params={{ ...params, tableName }} active={active} />
      </div>
      {expanded && <ColumnList params={{ ...params, tableName }} />}
    </li>
  );
}
