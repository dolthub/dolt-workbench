import { SqlQueryParams } from "@lib/params";
import css from "./index.module.css";

type Props = {
  rowsLen: number;
  params: SqlQueryParams;
};

export default function TimeoutMessage(props: Props) {
  const rows = props.rowsLen === 1 ? "row was" : "rows were";
  return (
    <div>
      <p className={css.status}>
        {props.rowsLen} {rows} selected on{" "}
        <span className={css.bold}>{props.params.refName}</span> before query
        timed out.
      </p>
    </div>
  );
}
