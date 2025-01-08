import { Button, QueryHandler } from "@dolthub/react-components";
import {
  CommitForCommitSelectorFragment,
  useCommitsForSelectorQuery,
} from "@gen/graphql-types";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { RefParams } from "@lib/params";
import { diff } from "@lib/urls";
import { BsArrowLeft } from "@react-icons/all-files/bs/BsArrowLeft";
import { useState } from "react";
import Link from "@components/links/Link";
import CommitSelect from "./CommitSelect";
import css from "./index.module.css";

type Props = {
  params: RefParams;
};

type InnerProps = Props & {
  commits: CommitForCommitSelectorFragment[];
};

function Inner(props: InnerProps) {
  const [fromCommit, setFromCommit] = useState("");
  const [toCommit, setToCommit] = useState("");

  return (
    <div className={css.outer}>
      {props.commits.length && (
        <form>
          <div className={css.selectors}>
            <CommitSelect
              commits={props.commits}
              currentCommitId={toCommit}
              label="to commit"
              onChange={setToCommit}
            />
            <div className={css.arrow}>
              <BsArrowLeft />
            </div>

            <CommitSelect
              commits={props.commits}
              currentCommitId={fromCommit}
              label="from commit"
              onChange={setFromCommit}
            />
          </div>
        </form>
      )}
      {fromCommit && toCommit && fromCommit !== toCommit && (
        <Link
          {...diff({
            ...props.params,
            refName: props.params.refName,
            fromCommitId: fromCommit,
            toCommitId: toCommit,
          })}
          className={css.viewDiffButton}
        >
          <Button>
            View Diff <FaChevronRight />
          </Button>
        </Link>
      )}
    </div>
  );
}

export default function CommitSelectForm(props: Props) {
  const commitRes = useCommitsForSelectorQuery({ variables: props.params });
  return (
    <QueryHandler
      result={commitRes}
      render={data => <Inner {...props} commits={data.allCommits} />}
    />
  );
}
