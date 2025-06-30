import Link from "@components/links/Link";
import { Button, Loader } from "@dolthub/react-components";
import {
  BranchFragment,
  RemoteFragment,
  useRemoteBranchDiffCountsQuery,
} from "@gen/graphql-types";
import { OptionalRefParams } from "@lib/params";
import { diff } from "@lib/urls";
import BehindAheadCount from "./BehindAheadCount";
import CreateBranchButton from "./CreateBranchButton";
import css from "./index.module.css";
import SyncButton from "./SyncButton";
import { getBranchName } from "./utils";

type Props = {
  branch: BranchFragment;
  remote: RemoteFragment;
  params: OptionalRefParams;
};

export default function RemoteBranchRow({ branch, remote, params }: Props) {
  const { branchNameWithRemoteName, remoteBranchName } = getBranchName(
    branch.branchName,
  );
  const res = useRemoteBranchDiffCountsQuery({
    variables: {
      databaseName: params.databaseName,
      toRefName: remoteBranchName,
      fromRefName: branchNameWithRemoteName,
    },
  });

  if (res.loading) return <Loader loaded={false} />;

  return (
    <tr>
      <td>{branchNameWithRemoteName}</td>
      <BehindAheadCount
        counts={res.data?.remoteBranchDiffCounts}
        branch={remoteBranchName}
        remoteAndBranchName={branchNameWithRemoteName}
      />
      <td>
        {res.data ? (
          <SyncButton
            counts={res.data.remoteBranchDiffCounts}
            params={params}
            remote={remote}
            remoteBranchName={remoteBranchName}
          />
        ) : (
          <CreateBranchButton
            params={params}
            remote={remote}
            branchName={remoteBranchName}
          />
        )}
      </td>
      <td>
        {(!!res.data?.remoteBranchDiffCounts.ahead ||
          !!res.data?.remoteBranchDiffCounts.behind) && (
          <Link
            {...diff({
              ...params,
              refName: remoteBranchName,
              fromCommitId: branchNameWithRemoteName,
              toCommitId: remoteBranchName,
            })}
            className={css.viewDiffButton}
          >
            <Button.Link>View Diff</Button.Link>
          </Link>
        )}
      </td>
    </tr>
  );
}
