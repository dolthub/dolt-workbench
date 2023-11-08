import { ApolloError } from "@apollo/client";
import ErrorMsg from "@components/ErrorMsg";
import { useDiffContext } from "@contexts/diff";
import { DiffStatForDiffsFragment, useDiffStatQuery } from "@gen/graphql-types";
import { gqlErrorPrimaryKeyChange } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import { DiffParamsWithRefs } from "@lib/params";
import cx from "classnames";
import SummaryStats from "./SummaryStats";
import css from "./index.module.css";

type Props = {
  params: DiffParamsWithRefs & { refName?: string };
  className?: string;
  flat?: boolean;
};

type InnerProps = Props & {
  diffStat?: DiffStatForDiffsFragment;
  err?: ApolloError;
  loading: boolean;
};

function Inner(props: InnerProps) {
  const { diffSummaries } = useDiffContext();
  const isPrimaryKeyChange = errorMatches(gqlErrorPrimaryKeyChange, props.err);
  return (
    <div
      className={cx(css.summary, props.className)}
      data-cy="commit-diff-stat"
    >
      <ErrorMsg
        err={props.err}
        className={cx({ [css.primaryKeyChange]: isPrimaryKeyChange })}
      />
      <SummaryStats
        {...props}
        numSchemaChanges={
          diffSummaries.filter(ds => ds.hasSchemaChanges).length
        }
      />
    </div>
  );
}

export default function DiffStat(props: Props) {
  const { type } = useDiffContext();
  const { data, loading, error } = useDiffStatQuery({
    variables: { ...props.params, type },
  });

  return (
    <Inner {...props} diffStat={data?.diffStat} err={error} loading={loading} />
  );
}
