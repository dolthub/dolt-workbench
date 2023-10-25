import { ApolloError } from "@apollo/client";
import SmallLoader from "@components/SmallLoader";
import { DiffStatForDiffsFragment } from "@gen/graphql-types";
import cx from "classnames";
import SummaryStat from "./SummaryStat";
import css from "./index.module.css";

type Props = {
  diffStat?: DiffStatForDiffsFragment;
  err?: ApolloError;
  flat?: boolean;
  loading?: boolean;
  numSchemaChanges: number;
};

export default function SummaryStats({
  diffStat,
  err,
  flat,
  loading,
  numSchemaChanges,
}: Props) {
  return (
    <div>
      {loading && (
        <SmallLoader.WithText
          outerClassName={cx(css.loading, { [css.marTop]: !!flat })}
          loaded={false}
          text="Loading commit diff stats..."
        />
      )}
      <div className={css.stats}>
        <SummaryStat
          flat={flat}
          value={diffStat?.rowsDeleted}
          statSingle="row deleted"
          statPlural="rows deleted"
          err={err}
          loading={loading}
          red
        />
        <SummaryStat
          flat={flat}
          value={diffStat?.rowsAdded}
          statSingle="row added"
          statPlural="rows added"
          err={err}
          loading={loading}
          green
        />
        <SummaryStat
          flat={flat}
          value={diffStat?.rowsModified}
          statSingle="row modified"
          statPlural="rows modified"
          err={err}
          loading={loading}
        />
        <SummaryStat
          flat={flat}
          value={numSchemaChanges}
          statSingle="schema change"
          statPlural="schema changes"
          err={err}
          loading={loading}
          blue
        />
      </div>
    </div>
  );
}
