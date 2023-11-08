import { PullParams } from "@lib/params";
import BranchSelectForm from "./BranchSelectForm";

type Props = {
  params: PullParams;
};

export default function ForPull(props: Props) {
  return <BranchSelectForm params={props.params} />;
}
