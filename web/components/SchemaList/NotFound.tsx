import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { RefParams } from "@lib/params";
import css from "./index.module.css";

type Props = {
  name: string;
  params: RefParams;
};

export default function NotFound(props: Props) {
  const { isDolt } = useDatabaseDetails();
  const label = `db-${props.name}-empty`;
  return (
    <p className={css.text} data-cy={label}>
      No {props.name} found
      {isDolt && (
        <span>
          {" "}
          on <code aria-label={`${label}-ref`}>{props.params.refName}</code>
        </span>
      )}
    </p>
  );
}
