import { ErrorMsg } from "@dolthub/react-components";
import { ApolloErrorType } from "@lib/errors/types";
import cx from "classnames";
import { useEffect } from "react";
import css from "./index.module.css";
import { improveError } from "./utils";

type Props = {
  mergeErr?: ApolloErrorType;
  setShowDirections: (s: boolean) => void;
};

export default function ErrorsWithDirections({
  mergeErr,
  setShowDirections,
}: Props) {
  const mergeErrs = improveError(mergeErr);

  useEffect(() => {
    if (!mergeErr) return;
    setShowDirections(true);
  }, [mergeErr, setShowDirections]);

  return (
    <div className={css.errContainer}>
      <ErrorMsg errString={mergeErrs.improvedErr} className={css.err} />
      {mergeErrs.isTimeoutErr && (
        <div className={cx(css.red, css.err)} aria-label="timeout-err">
          Timed out merging pull request. Try merging using SQL.
        </div>
      )}
      {mergeErrs.isConflictsErr && (
        <div className={cx(css.red, css.err)} aria-label="conflicts-err">
          Cannot merge due to conflicts. Please resolve and try again.
        </div>
      )}
    </div>
  );
}
