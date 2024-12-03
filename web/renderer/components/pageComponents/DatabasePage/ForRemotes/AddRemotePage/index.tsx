import { DatabaseParams } from "@lib/params";
import AddRemoteForm from "./AddRemoteForm";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams;
};

export default function AddRemotePage(props: Props): JSX.Element {
  return (
    <div className={css.container}>
      <h1>Add Remote</h1>
      <AddRemoteForm {...props} />
    </div>
  );
}
