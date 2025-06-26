import Link from "@components/links/Link";
import { formatNumber, pluralize } from "@dolthub/web-utils";
import { PullConflictSummaryFragment } from "@gen/graphql-types";
import { PullDiffParams } from "@lib/params";
import { pullConflicts } from "@lib/urls";
import { ImTable2 } from "@react-icons/all-files/im/ImTable2";
import css from "./index.module.css";

type Props = {
  params: PullDiffParams;
  conflictsSummary?: PullConflictSummaryFragment[];
};

export default function MergeConflicts(props: Props) {
  const hasConflictsSummary = !!props.conflictsSummary?.length;
  return (
    <span className={css.conflictsNote}>
      This branch has conflicts with the base branch
      {hasConflictsSummary ? ":" : "."}
      {hasConflictsSummary && (
        <ul>
          {props.conflictsSummary?.map(conflict => (
            <li key={conflict._id}>
              <span className={css.conflictsTable}>
                <ImTable2 />
                <Link
                  {...pullConflicts({
                    ...props.params,
                    tableName: conflict.tableName,
                  })}
                >
                  {conflict.tableName}
                </Link>
              </span>
              <span>
                {getNumConflictsMsg(conflict)}{" "}
                {pluralize(
                  (conflict.numDataConflicts ?? 0) +
                    (conflict.numSchemaConflicts ?? 0),
                  "conflict",
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}

function getNumConflictsMsg(con: PullConflictSummaryFragment): string {
  const dataConflicts = con.numDataConflicts
    ? `${formatNumber(con.numDataConflicts)} data`
    : "";
  const schemaConflicts = con.numSchemaConflicts
    ? `${formatNumber(con.numSchemaConflicts)} schema`
    : "";
  if (dataConflicts && schemaConflicts) {
    return `${dataConflicts} and ${schemaConflicts}`;
  }
  if (dataConflicts) {
    return dataConflicts;
  }
  if (schemaConflicts) {
    return schemaConflicts;
  }
  return "";
}
