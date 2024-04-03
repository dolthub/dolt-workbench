import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Button, ErrorMsg, Loader } from "@dolthub/react-components";
import {
  PullDetailsFragment,
  PullState,
  useDeleteBranchMutation,
  useGetBranchForPullQuery,
} from "@gen/graphql-types";
import useDefaultBranch from "@hooks/useDefaultBranch";
import useMutation from "@hooks/useMutation";
import { BranchParams, DatabaseParams, PullDiffParams } from "@lib/params";
import { refetchDeletedBranch } from "@lib/refetchQueries";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  params: PullDiffParams;
  pullDetails: PullDetailsFragment;
};

type InnerProps = Props & {
  branchExists: boolean;
};

function Inner(props: InnerProps) {
  const params: DatabaseParams = {
    databaseName: props.params.databaseName,
  };
  const branchParams: BranchParams = {
    ...params,
    branchName: props.params.fromBranchName,
  };

  const { defaultBranchName, loading: branchLoading } =
    useDefaultBranch(params);

  const {
    mutateFn: deleteBranch,
    err,
    setErr,
    loading,
  } = useMutation({
    hook: useDeleteBranchMutation,
    refetchQueries: refetchDeletedBranch(props.params),
  });

  const onClick = async () => {
    setErr(undefined);
    await deleteBranch({ variables: branchParams });
  };

  if (branchLoading) return <Loader loaded={false} />;

  if (
    !props.branchExists ||
    props.params.fromBranchName === defaultBranchName ||
    props.params.fromBranchName === props.params.refName
  ) {
    return null;
  }

  const isMerged = props.pullDetails.state === PullState.Merged;

  return (
    <HideForNoWritesWrapper params={params}>
      <div>
        <div
          className={cx(css.container, {
            [css.mergedContainer]: isMerged,
          })}
        >
          <div className={css.deleteMsg}>
            <div>
              <div className={css.success}>
                {isMerged
                  ? `Pull request successfully merged`
                  : "Closed with unmerged commits"}
              </div>
              {isMerged && (
                <p>
                  The branch <code>{props.params.fromBranchName}</code> can
                  safely be deleted.
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={onClick}
            className={cx(css.deleteBtn, {
              [css.merged]: isMerged,
            })}
            red
            data-cy="delete-branch-button"
          >
            Delete Branch
          </Button>
        </div>
        <Loader loaded={!loading} />
        <ErrorMsg err={err} className={css.err} />
      </div>
    </HideForNoWritesWrapper>
  );
}

export default function DeleteBranch(props: Props) {
  const res = useGetBranchForPullQuery({
    variables: {
      databaseName: props.params.databaseName,
      branchName: props.params.fromBranchName,
    },
  });
  if (res.loading) return <Loader loaded={false} />;
  return <Inner {...props} branchExists={!!res.data?.branch} />;
}
