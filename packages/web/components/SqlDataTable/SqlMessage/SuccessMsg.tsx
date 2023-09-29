import { SqlQueryParams } from "@lib/params";
import { isMutation } from "@lib/parseSqlQuery";
import { pluralize } from "@lib/pluralize";
import css from "./index.module.css";

type Props = {
  executionMessage?: string;
  rowsLen: number;
  params: SqlQueryParams;
};

export default function SuccessMsg(props: Props) {
  // const lower = props.params.q.toLowerCase();
  if (isMutation(props.params.q)) {
    return (
      <div className={css.status}>
        {/* {lower.startsWith("use") && <BranchMsg params={props.params} />} */}
        <p>
          {props.executionMessage?.length
            ? props.executionMessage
            : "Query OK."}
        </p>
        {/* {lower.includes("dolt_checkout") && (
          <p>
            Warning: using <code>DOLT_CHECKOUT</code> to change a branch from
            the workbench will not work. Please use the branch dropdown.
          </p>
        )} */}
      </div>
    );
  }
  return (
    <p className={css.status}>
      {props.rowsLen} {pluralize(props.rowsLen, "row")} selected on{" "}
      <span className={css.bold}>{props.params.refName}</span>
    </p>
  );
}
