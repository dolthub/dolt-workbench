import { useDataTableContext } from "@contexts/dataTable";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { ColumnStatus, SetColumnStatus } from "@lib/tableTypes";
import cx from "classnames";
import InfiniteScroll from "react-infinite-scroller";
import Body from "./Body";
import Head from "./Head";
import css from "./index.module.css";

type Props = {
  hasMore?: boolean;
  loadMore: () => void;
  rows: RowForDataTableFragment[];
  columns: ColumnForDataTableFragment[];
  columnStatus: ColumnStatus;
  setColumnStatus: SetColumnStatus;
};

export default function DesktopTable({ columns, rows, ...props }: Props) {
  const { params } = useDataTableContext();
  return (
    <InfiniteScroll
      className={cx(css.desktopContainer, {
        [css.containerNoTable]: !params.tableName,
      })}
      hasMore={props.hasMore}
      loadMore={props.loadMore}
      pageStart={0}
      loader={
        <div className={css.loader} key={0}>
          Loading rows ...
        </div>
      }
      useWindow={false}
      initialLoad
      getScrollParent={() => document.getElementById("main-content")}
    >
      <table className={css.dataTable}>
        <Head
          columns={columns}
          columnStatus={props.columnStatus}
          setColumnStatus={props.setColumnStatus}
        />
        <Body rows={rows} columns={columns} columnStatus={props.columnStatus} />
      </table>
    </InfiniteScroll>
  );
}
