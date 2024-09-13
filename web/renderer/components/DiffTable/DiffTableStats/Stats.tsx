import { DiffStatForDiffsFragment, TableDiffType } from "@gen/graphql-types";
import SummaryStat from "./SummaryStat";

type Props = {
  diffStat: DiffStatForDiffsFragment;
  tableType: TableDiffType;
};

export default function Stats({ diffStat, tableType }: Props) {
  return (
    <>
      <SummaryStat
        value={tableType === TableDiffType.Added ? 0 : diffStat.rowsDeleted}
        count={diffStat.rowCount}
        statSingle="Row Deleted"
        statPlural="Rows Deleted"
        red
      />
      <SummaryStat
        value={tableType === TableDiffType.Dropped ? 0 : diffStat.rowsAdded}
        count={diffStat.rowCount}
        statSingle="Row Added"
        statPlural="Rows Added"
        green
      />
      <SummaryStat
        value={diffStat.rowsModified}
        count={diffStat.rowCount}
        statSingle="Row Modified"
        statPlural="Rows Modified"
      />
      <SummaryStat
        value={diffStat.cellsModified}
        count={diffStat.cellCount}
        statSingle="Cell Modified"
        statPlural="Cells Modified"
      />
      <SummaryStat
        value={diffStat.rowsUnmodified}
        count={diffStat.rowCount}
        statSingle="Row Unmodified"
        statPlural="Rows Unmodified"
      />
    </>
  );
}
