import { RefParams } from "@lib/params";
import css from "./index.module.css";

type Props = {
  name: string;
  params: RefParams;
};

export default function NotFound(props: Props) {
  return (
    <p className={css.text} data-cy={`db-${props.name}-empty`}>
      No {props.name} found on <code>{props.params.refName}</code>
    </p>
  );
}
