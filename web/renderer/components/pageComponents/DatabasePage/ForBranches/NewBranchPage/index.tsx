import { OptionalRefParams } from "@lib/params";
import NewBranchForm from "./NewBranchForm";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams;
};

export default function NewBranchPage(props: Props): JSX.Element {
  return (
    <div className={css.container}>
      <h1>New Branch</h1>
      <NewBranchForm {...props} />
    </div>
  );
}
