import StatusWithOptions from "@components/StatusWithOptions";
import { useDiffContext } from "@contexts/diff";
import { DiffSummaryFragment, TableDiffType } from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { DatabaseOptionalSchemaParams, RequiredRefsParams } from "@lib/params";
import { createPostgresTableName } from "@lib/postgres";
import { useEffect, useState } from "react";
import DataSection from "./DataSection";
import DiffTableStats from "./DiffTableStats";
import SchemaSection from "./SchemaSection";
import TabButtons from "./TabButtons";
import css from "./index.module.css";

type Props = {
  params: DatabaseOptionalSchemaParams;
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
  const { isPostgres } = useDatabaseDetails(props.params.connectionName);

  if (!activeTableName) return null;

  const currentDiffSummary = getCurrentDiffSummary(
    diffSummaries,
    activeTableName,
    isPostgres,
    props.params.schemaName,
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

function getCurrentDiffSummary(
  diffSummaries: DiffSummaryFragment[],
  activeTableName: string,
  isPostgres: boolean,
  schemaName?: string,
): DiffSummaryFragment | undefined {
  return diffSummaries.find(ds => {
    if (isPostgres) {
      const activeTableWithSchema = createPostgresTableName(
        activeTableName,
        schemaName ?? "public",
      );
      return (
        ds.fromTableName === activeTableWithSchema ||
        ds.toTableName === activeTableWithSchema
      );
    }
    return (
      ds.fromTableName === activeTableName || ds.toTableName === activeTableName
    );
  });
}
