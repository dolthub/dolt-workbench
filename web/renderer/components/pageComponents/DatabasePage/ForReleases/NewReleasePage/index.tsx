import { OptionalRefParams } from "@lib/params";
import NewReleaseForm from "./NewReleaseForm";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams;
};

export default function NewReleasePage(props: Props): JSX.Element {
  return (
    <div className={css.container}>
      <h1>New Release</h1>
      <NewReleaseForm {...props} />
    </div>
  );
}
