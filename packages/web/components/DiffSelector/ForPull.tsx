import { PullDiffParams } from "@lib/params";
import DiffSelector from "./component";

type Props = {
  params: PullDiffParams;
};

export default function ForPull(props: Props) {
  return (
    <DiffSelector>
      Viewing changes between <code>{props.params.refName}</code> and{" "}
      <code>{props.params.fromBranchName}</code>
    </DiffSelector>
  );
}
