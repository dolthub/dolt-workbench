import {
  ColumnForDiffTableListFragment,
  RowDiffForTableListFragment,
} from "@gen/graphql-types";
import { ColumnStatus, SetColumnStatus } from "@lib/tableTypes";
import Row from "./Row";
import { HiddenColIndexes } from "./utils";

type Props = {
  cols: ColumnForDiffTableListFragment[];
  rowDiffs: RowDiffForTableListFragment[];
  hiddenColIndexes: HiddenColIndexes;
  hideCellButtons?: boolean;
  columnStatus: ColumnStatus;
  setColumnStatus: SetColumnStatus;
  userCanWrite: boolean;
  refName: string;
};

export default function Body(props: Props) {
  return (
    <tbody>
      {props.rowDiffs.map((r, ridx) => (
        /* eslint-disable-next-line react/jsx-key */
        <Row {...props} ridx={ridx} rowDiff={r} />
      ))}
    </tbody>
  );
}
