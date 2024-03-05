import Link from "@components/links/Link";
import { useDataTableContext } from "@contexts/dataTable";
import { Button } from "@dolthub/react-components";
import { useOnClickOutside } from "@dolthub/react-hooks";
import { RowForDataTableFragment } from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { RefParams } from "@lib/params";
import { sqlQuery } from "@lib/urls";
import { BiCaretRight } from "@react-icons/all-files/bi/BiCaretRight";
import cx from "classnames";
import { useRef, useState } from "react";
import css from "./index.module.css";
import { ReferencedColumn, getForeignKeyMap } from "./utils";

type Props = {
  row: RowForDataTableFragment;
  cidx: number;
  colName: string;
};

export default function ForeignKeyButton(props: Props) {
  const { params, foreignKeys } = useDataTableContext();
  const foreignKeyMap = getForeignKeyMap(
    foreignKeys,
    props.row,
    props.cidx,
    props.colName,
  );
  const hasForeignKey = !!Object.keys(foreignKeyMap).length;
  const [showTableDropdown, setShowTableDropdown] = useState(false);
  const tableDropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(tableDropdownRef, () => setShowTableDropdown(false));

  if (!hasForeignKey) return null;

  return (
    <div ref={tableDropdownRef} className={css.foreignKey}>
      <Button.Link
        onClick={() => setShowTableDropdown(true)}
        className={cx(css.button, css.foreignKeyButton)}
      >
        Follow Reference
        <BiCaretRight />
      </Button.Link>
      {showTableDropdown && (
        <div className={css.foreignKeyDropdown}>
          {Object.keys(foreignKeyMap).map(table => (
            <FKTableLink
              params={params}
              table={table}
              columns={foreignKeyMap[table]}
              key={table}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type FKTableLinkProps = {
  params: RefParams;
  table: string;
  columns: ReferencedColumn[];
};

function FKTableLink(props: FKTableLinkProps) {
  const { addWhereClauseToSelect } = useSqlBuilder();

  const q = addWhereClauseToSelect(
    props.table,
    props.columns.map(c => {
      return { col: c.columnName, val: c.columnValue };
    }),
  );

  return (
    <div key={props.table}>
      <Link {...sqlQuery({ ...props.params, q })}>{props.table}</Link>
    </div>
  );
}
