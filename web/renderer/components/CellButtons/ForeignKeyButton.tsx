import Link from "@components/links/Link";
import { useDataTableContext } from "@contexts/dataTable";
import { Button } from "@dolthub/react-components";
import { useOnClickOutside } from "@dolthub/react-hooks";
import { RowForDataTableFragment } from "@gen/graphql-types";
import { stackingParamsToQuery } from "@lib/dataTableParams";
import { RefOptionalSchemaParams } from "@lib/params";
import { table } from "@lib/urls";
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
  const { params, foreignKeys, tableShape } = useDataTableContext();
  const foreignKeyMap = getForeignKeyMap(
    foreignKeys,
    props.row,
    props.cidx,
    props.colName,
  );
  const hasForeignKey = !!Object.keys(foreignKeyMap).length;
  const [showTableDropdown, setShowTableDropdown] = useState(false);
  const tableDropdownRef = useRef<HTMLSpanElement>(null);
  useOnClickOutside(tableDropdownRef, () => setShowTableDropdown(false));

  if (!hasForeignKey || !tableShape) return null;

  return (
    <span ref={tableDropdownRef} className={css.foreignKey}>
      <Button.Link
        onClick={() => setShowTableDropdown(true)}
        className={cx(css.button, css.foreignKeyButton)}
      >
        Follow Reference
        <BiCaretRight />
      </Button.Link>
      {showTableDropdown && (
        <span className={css.foreignKeyDropdown}>
          {Object.keys(foreignKeyMap).map(t => (
            <FKTableLink
              params={params}
              table={t}
              columns={foreignKeyMap[t]}
              key={t}
            />
          ))}
        </span>
      )}
    </span>
  );
}

type FKTableLinkProps = {
  params: RefOptionalSchemaParams;
  table: string;
  columns: ReferencedColumn[];
};

function FKTableLink(props: FKTableLinkProps) {
  const where = props.columns.map(c => {
    return { column: c.columnName, value: c.columnValue };
  });
  const route = table({
    databaseName: props.params.databaseName,
    refName: props.params.refName,
    schemaName: props.params.schemaName,
    tableName: props.table,
  });
  const query = stackingParamsToQuery({ where });

  return (
    <span key={props.table}>
      <Link
        href={{ pathname: route.hrefPathname(), query }}
        as={{ pathname: route.asPathname(), query }}
      >
        {props.table}
      </Link>
    </span>
  );
}
