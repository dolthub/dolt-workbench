import { FormSelectTypes } from "@dolthub/react-components";
import { excerpt, getTimeAgoString } from "@dolthub/web-utils";
import { CommitForHistoryFragment } from "@gen/graphql-types";
import { useCommitListForBranch } from "@hooks/useCommitListForBranch";
import useDefaultBranch from "@hooks/useDefaultBranch";
import { ApolloErrorType } from "@lib/errors/types";
import { OptionalRefParams, RefParams } from "@lib/params";
import css from "./index.module.css";

type ReturnType = {
  commitOptions: Array<FormSelectTypes.Option<string>>;
  refParams: RefParams;
  error?: ApolloErrorType;
};

export default function useGetCommitOptionsForSelect(
  params: OptionalRefParams,
): ReturnType {
  const { defaultBranchName } = useDefaultBranch(params);
  const refParams = {
    ...params,
    refName: params.refName ?? defaultBranchName,
  };
  const commitRes = useCommitListForBranch(refParams, true);

  const commitOptions =
    commitRes.commits?.map(c => {
      return {
        value: c.commitId,
        label: c.commitId,
        details: <CommitDetails commit={c} />,
      };
    }) ?? [];

  return { commitOptions, refParams, error: commitRes.error };
}

function limitTwoLines(s: string, maxChars: number): string {
  return excerpt(s.replace(/(\r\n|\n|\r)/g, " "), maxChars);
}

const maxCommitMsgChars = 90;

function CommitDetails(props: { commit: CommitForHistoryFragment }) {
  return (
    <div>
      <div>{limitTwoLines(props.commit.message, maxCommitMsgChars)}</div>
      <div className={css.commitTimeAgo}>
        {getTimeAgoString(props.commit.committedAt)}
      </div>
    </div>
  );
}
