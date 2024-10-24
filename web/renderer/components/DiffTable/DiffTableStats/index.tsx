import { useDiffContext } from "@contexts/diff";
import { ErrorMsg, SmallLoader } from "@dolthub/react-components";
import { DiffSummaryFragment, useDiffStatQuery } from "@gen/graphql-types";
import { gqlErrorPrimaryKeyChange } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import cx from "classnames";
import Stats from "./Stats";
import css from "./index.module.css";

type Props = {
  hiddenColIndexes: number[];
  diffSummary: DiffSummaryFragment;
};

export default function DiffTableStats(props: Props) {
  const { params, refName, type } = useDiffContext();
  const { data, loading, error } = useDiffStatQuery({
    variables: {
      ...params,
      refName,
      tableName: props.diffSummary.tableName,
      type,
    },
  });

  if (loading) {
    return (
      <SmallLoader.WithText
        loaded={false}
        text="Loading table stats..."
        outerClassName={css.loader}
      />
    );
  }

  if (error || !data?.diffStat) {
    const isPrimaryKeyChange = errorMatches(gqlErrorPrimaryKeyChange, error);
    return (
      <div>
        Table stats unavailable{" "}
        <ErrorMsg
          className={cx(css.err, {
            [css.primaryKeyChange]: isPrimaryKeyChange,
          })}
          err={error?.message ? error : undefined}
          errString="Table diff stats request timed out"
        />
      </div>
    );
  }

  return (
    <div className={css.tableInfo} data-cy="diff-table-stats">
      <Stats
        {...props}
        diffStat={data.diffStat}
        tableType={props.diffSummary.tableType}
      />
    </div>
  );
}
