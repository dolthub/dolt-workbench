import StatusWithOptions from "@components/StatusWithOptions";
import { useDiffContext } from "@contexts/diff";
import { DiffSummaryFragment, TableDiffType } from "@gen/graphql-types";
import { DatabaseParams, RequiredRefsParams } from "@lib/params";
import { useEffect, useState } from "react";
import DataSection from "./DataSection";
import DiffTableStats from "./DiffTableStats";
import SchemaSection from "./SchemaSection";
import TabButtons from "./TabButtons";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams;
  hideCellButtons?: boolean;
};

type InnerProps = {
  diffSummary: DiffSummaryFragment;
  hideCellButtons?: boolean;
};

export function Inner({ diffSummary, hideCellButtons }: InnerProps) {
  const { params, refName } = useDiffContext();
  const [hiddenColIndexes, setHiddenColIndexes] = useState<number[]>([]);
  const displayedTableName =
    diffSummary.tableType === TableDiffType.Renamed
      ? `${diffSummary.fromTableName} → ${diffSummary.toTableName}`
      : diffSummary.tableName;

  const [showData, setShowData] = useState(diffSummary.hasDataChanges);

  useEffect(() => {
    setShowData(diffSummary.hasDataChanges);
  }, [diffSummary.hasDataChanges, displayedTableName]);

  return (
    <div className={css.container}>
      <div className={css.header}>
        <h1 data-cy="diff-table-name">{displayedTableName}</h1>
        {isShowingUncommittedChanges(params) && (
          <StatusWithOptions params={{ ...params, refName }} forDiffPage />
        )}
      </div>
      <div className={css.diffStat}>
        <DiffTableStats
          diffSummary={diffSummary}
          hiddenColIndexes={hiddenColIndexes}
        />
      </div>
      <TabButtons
        showData={showData}
        setShowData={setShowData}
        hasSchemaChanges={diffSummary.hasSchemaChanges}
        hasDataChanges={diffSummary.hasDataChanges}
      />
      {showData ? (
        <DataSection
          diffSummary={diffSummary}
          hiddenColIndexes={hiddenColIndexes}
          setHiddenColIndexes={setHiddenColIndexes}
          hideCellButtons={hideCellButtons}
        />
      ) : (
        <SchemaSection diffSummary={diffSummary} />
      )}
    </div>
  );
}

export default function DiffTable(props: Props) {
  const { activeTableName, diffSummaries } = useDiffContext();

  if (!activeTableName) return null;
  const currentDiffSummary = diffSummaries.find(
    ds =>
      ds.fromTableName === activeTableName ||
      ds.toTableName === activeTableName,
  );
  if (!currentDiffSummary) return null;
  return <Inner {...props} diffSummary={currentDiffSummary} />;
}

function isShowingUncommittedChanges(params: RequiredRefsParams): boolean {
  return (
    params.fromRefName === "WORKING" ||
    params.toRefName === "WORKING" ||
    params.fromRefName === "STAGED" ||
    params.toRefName === "STAGED"
  );
}
