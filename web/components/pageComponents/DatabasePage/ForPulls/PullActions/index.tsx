import { PullDetailsFragment, PullState } from "@gen/graphql-types";
import { PullDiffParams } from "@lib/params";
import DeleteBranch from "./DeleteBranch";
import Merge from "./Merge";

type Props = {
  params: PullDiffParams;
  pullDetails: PullDetailsFragment;
};

export default function PullActions(props: Props) {
  if (props.pullDetails.state === PullState.Merged) {
    return <DeleteBranch {...props} />;
  }

  return <Merge {...props} />;
}
