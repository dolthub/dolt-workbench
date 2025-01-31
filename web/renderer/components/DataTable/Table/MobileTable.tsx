import { Button } from "@dolthub/react-components";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { ColumnStatus, SetColumnStatus } from "@lib/tableTypes";
import Body from "./Body";
import Head from "./Head";
import css from "./index.module.css";

type Props = {
  connectionName: string;
  hasMore?: boolean;
  loadMore: () => Promise<void>;
  rows: RowForDataTableFragment[];
  columns: ColumnForDataTableFragment[];
  columnStatus: ColumnStatus;
  setColumnStatus: SetColumnStatus;
};

export default function MobileTable({ columns, rows, ...props }: Props) {
  return (
    <div className={css.mobileContainer}>
      <table className={css.dataTable} data-cy="mobile-db-data-table">
        <Head
          columns={columns}
          isMobile
          columnStatus={props.columnStatus}
          setColumnStatus={props.setColumnStatus}
        />
        <Body
          connectionName={props.connectionName}
          rows={rows}
          columns={columns}
          isMobile
          columnStatus={props.columnStatus}
        />
      </table>
      {props.hasMore && (
        <Button onClick={props.loadMore} className={css.mobileNextPageButton}>
          load more
        </Button>
      )}
    </div>
  );
}
