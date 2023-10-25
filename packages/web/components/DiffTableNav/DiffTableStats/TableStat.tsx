import SummaryStat from "@components/DiffStat/SummaryStat";
import ErrorMsg from "@components/ErrorMsg";
import SmallLoader from "@components/SmallLoader";
import {
  DiffStatForDiffsFragment,
  DiffSummaryFragment,
  TableDiffType,
  useDiffStatQuery,
} from "@gen/graphql-types";
import { gqlErrorPrimaryKeyChange } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import { DiffParamsWithRefs } from "@lib/params";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  diffSummary: DiffSummaryFragment;
  params: DiffParamsWithRefs & { refName: string };
};

type InnerProps = {
  diffStat?: DiffStatForDiffsFragment;
  diffSummary: DiffSummaryFragment;
  loading: boolean;
  error?: Error;
};

function Inner({ diffStat, diffSummary, loading, error }: InnerProps) {
  if (loading) {
    return (
      <div className={cx(css.marLeft, css.loading)}>
        <SmallLoader.WithText loaded={false} text="Loading table stats..." />
      </div>
    );
  }

  const isPrimaryKeyChange = errorMatches(gqlErrorPrimaryKeyChange, error);
  if (isPrimaryKeyChange) {
    return null;
  }

  if (diffStat && !error) {
    return (
      <>
        <SummaryStat
          value={
            diffSummary.tableType === TableDiffType.Added
              ? 0
              : diffStat.rowsDeleted
          }
          red
        />
        <SummaryStat
          value={
            diffSummary.tableType === TableDiffType.Dropped
              ? 0
              : diffStat.rowsAdded
          }
          green
        />
        <SummaryStat value={diffStat.rowsModified} />
        <SummaryStat value={diffSummary.hasSchemaChanges ? 1 : 0} blue />
      </>
    );
  }

  return (
    <div className={css.marLeft}>
      <ErrorMsg
        className={css.err}
        err={error?.message ? error : undefined}
        errString="Table diff summary request timed out"
      />
    </div>
  );
}

export default function TableStat(props: Props) {
  const res = useDiffStatQuery({
    variables: { ...props.params, tableName: props.diffSummary.tableName },
  });
  return (
    <div className={css.marLeft}>
      <Inner
        diffStat={res.data?.diffStat}
        loading={res.loading}
        error={res.error}
        diffSummary={props.diffSummary}
      />
    </div>
  );
}
