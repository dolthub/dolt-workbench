import Button from "@components/Button";
import {
  PullDetailsForPullDetailsDocument,
  PullDetailsFragment,
  useMergePullMutation,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { gqlPullHasConflicts } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import { PullDiffParams } from "@lib/params";
import { FiGitPullRequest } from "@react-icons/all-files/fi/FiGitPullRequest";
import cx from "classnames";
import { useState } from "react";
import ErrorsWithDirections from "./ErrorsWithDirections";
import MergeConflictsDirections from "./ErrorsWithDirections/MergeConflictsDirections";
import MergeMessage from "./MergeMessage";
import MergeMessageTitle from "./MergeMessageTitle";
import css from "./index.module.css";

type Props = {
  params: PullDiffParams;
  pullDetails: PullDetailsFragment;
};

export default function MergeButton(props: Props) {
  // const { setState } = usePullDetailsContext();
  const [showDirections, setShowDirections] = useState(false);
  const { mutateFn: merge, ...res } = useMutation({
    hook: useMergePullMutation,
    refetchQueries: [
      { query: PullDetailsForPullDetailsDocument, variables: props.params },
    ],
  });

  const hasConflicts = errorMatches(gqlPullHasConflicts, res.err);
  const disabled = hasConflicts;

  const red = hasConflicts;

  const onClick = async () => {
    await merge({ variables: props.params });
    // setState({ isMerging: true });
  };

  return (
    <div className={css.outer}>
      <span className={cx(css.picContainer, { [css.redIcon]: red })}>
        <FiGitPullRequest />
      </span>
      {/* <Arrow red={red} green={!red} /> */}
      <div className={css.container}>
        <div className={cx(css.top, { [css.red]: red })}>
          <MergeMessageTitle hasConflicts={hasConflicts} />
          <div aria-label="merge-button-container">
            <Button
              className={css.merge}
              onClick={onClick}
              disabled={disabled}
              data-cy="merge-button"
              green
            >
              {res.loading ? "Merging..." : "Merge"}
            </Button>
          </div>
          {res.err && (
            <ErrorsWithDirections
              mergeErr={res.err}
              setShowDirections={setShowDirections}
            />
          )}
        </div>
        <div className={cx(css.msg, { [css.msgRed]: red })}>
          <MergeMessage hasConflicts={hasConflicts} />
          <span className={css.toggle}>
            View{" "}
            <Button.Link onClick={() => setShowDirections(!showDirections)}>
              merge instructions
            </Button.Link>
            .
          </span>
          {showDirections && <MergeConflictsDirections {...props} />}
        </div>
      </div>
    </div>
  );
}
