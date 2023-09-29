import Btn from "@components/Btn";
import Popup from "@components/Popup";
import SmallLoader from "@components/SmallLoader";
import Tooltip from "@components/Tooltip";
import QueryHandler from "@components/util/QueryHandler";
import {
  Column,
  ColumnForTableListFragment,
  useTableForBranchQuery,
} from "@gen/graphql-types";
import { splitEnumOptions } from "@lib/dataTable";
import excerpt from "@lib/excerpt";
import { TableParams } from "@lib/params";
import { FiKey } from "@react-icons/all-files/fi/FiKey";
import { HiOutlineDotsHorizontal } from "@react-icons/all-files/hi/HiOutlineDotsHorizontal";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  params: TableParams;
};

export default function ColumnList({ params }: Props) {
  const res = useTableForBranchQuery({ variables: params });
  return (
    <div className={css.columns}>
      <QueryHandler
        result={res}
        loaderComponent={
          <SmallLoader.WithText
            outerClassName={css.smallLoader}
            loaded={false}
            text="Loading columns..."
          />
        }
        render={data => (
          <ol data-cy={`db-tables-table-${params.tableName}-column-list`}>
            {data.table.columns.map(c => (
              <ColumnItem col={c} key={c.name} />
            ))}
          </ol>
        )}
      />
    </div>
  );
}

function ColumnItem({ col }: { col: ColumnForTableListFragment }) {
  const isEnum = col.type.toLowerCase().includes("enum");
  const id = `${col.name}-primary-key`;
  return (
    <li
      key={col.name}
      className={cx(css.col, { [css.primaryKey]: col.isPrimaryKey })}
      data-cy={`db-tables-table-column-${col.name}`}
    >
      <div className={css.colName} title={col.name}>
        <span>{excerpt(col.name, 24)}</span>
        {col.isPrimaryKey && (
          <span
            data-cy={id}
            data-tooltip-place="left"
            data-tooltip-content="primary key"
            data-tooltip-id={id}
          >
            <FiKey className={css.key} />
            <Tooltip id={id} />
          </span>
        )}
      </div>
      <div className={css.colType}>
        {isEnum ? <EnumType c={col} /> : displayColumnType(col)}
      </div>
    </li>
  );
}

const collateRegex = /COLLATE UTF8MB4_0900_(AI_CI|BIN)/;

function getConstraints(c: Column): string {
  return c.constraints?.some(con => con.notNull) ? " NOT NULL" : "";
}

function displayColumnType(c: Column): string {
  const type = c.type.toUpperCase().replace(collateRegex, "");
  return `${type}${getConstraints(c)}`;
}

function EnumType(props: { c: Column }) {
  const opts = splitEnumOptions(props.c.type);
  const con = getConstraints(props.c);
  return (
    <span>
      <Popup
        on="hover"
        trigger={
          <Btn className={css.enumCol}>
            <span>ENUM{con}</span> <HiOutlineDotsHorizontal />
          </Btn>
        }
      >
        <ul className={css.enumPopup}>
          {opts.map(o => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </Popup>
    </span>
  );
}
