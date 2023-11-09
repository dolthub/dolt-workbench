import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { useState } from "react";
import DesktopTable from "./DesktopTable";
import MobileTable from "./MobileTable";
import { getInitialColumnStatus } from "./utils";

type Props = {
  hasMore?: boolean;
  loadMore: () => Promise<void>;
  rows: RowForDataTableFragment[];
  columns: ColumnForDataTableFragment[];
};

export default function Table(props: Props) {
  const initialColumnStatus = getInitialColumnStatus(props.columns);
  const [columnStatus, setColumnStatus] = useState(initialColumnStatus);
  return (
    <>
      <MobileTable
        {...props}
        columnStatus={columnStatus}
        setColumnStatus={setColumnStatus}
      />
      <DesktopTable
        {...props}
        columnStatus={columnStatus}
        setColumnStatus={setColumnStatus}
      />
    </>
  );
}
