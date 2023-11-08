import { PullDetailsFragment } from "@gen/graphql-types";
import { PullDiffParams } from "@lib/params";
import MergeButton from "./MergeButton";

type Props = {
  params: PullDiffParams;
  pullDetails: PullDetailsFragment;
};

export default function Merge(props: Props) {
  return <MergeButton {...props} />;
}
