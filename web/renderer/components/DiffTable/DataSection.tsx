import { DataTableProvider } from "@contexts/dataTable";
import { useDiffContext } from "@contexts/diff";
import { SqlEditorProvider } from "@contexts/sqleditor";
import { DiffSummaryFragment } from "@gen/graphql-types";
import DataDiff from "./DataDiff";
import { HiddenColIndexes, SetHiddenColIndexes } from "./DataDiff/utils";

type Props = {
  diffSummary: DiffSummaryFragment;
  hiddenColIndexes: HiddenColIndexes;
  setHiddenColIndexes: SetHiddenColIndexes;
  hideCellButtons?: boolean;
};

export default function DataSection(props: Props) {
  const { refName, params } = useDiffContext();

  const diffParams = {
    ...params,
    tableName: props.diffSummary.tableName,
    refName,
  };

  return (
    <DataTableProvider params={diffParams}>
      <SqlEditorProvider params={params}>
        <DataDiff {...props} params={diffParams} />
      </SqlEditorProvider>
    </DataTableProvider>
  );
}
