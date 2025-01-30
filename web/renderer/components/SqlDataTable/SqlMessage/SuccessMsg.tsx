import Link from "@components/links/Link";
import { pluralize } from "@dolthub/web-utils";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import useSqlParser from "@hooks/useSqlParser";
import { SqlQueryParams } from "@lib/params";
import { ref } from "@lib/urls";
import css from "./index.module.css";
import { parseQuery } from "./utils";

type Props = {
  executionMessage?: string;
  rowsLen: number;
  params: SqlQueryParams;
};

export default function SuccessMsg(props: Props) {
  const { isMutation } = useSqlParser();
  const lower = props.params.q.toLowerCase();
  if (isMutation(props.params.q)) {
    return (
      <div className={css.status}>
        {lower.startsWith("use") && <BranchMsg params={props.params} />}
        <p>
          {props.executionMessage?.length
            ? props.executionMessage
            : "Query OK."}
        </p>
        {lower.includes("dolt_checkout") && (
          <p>
            Warning: using <code>DOLT_CHECKOUT</code> to change a branch from
            the workbench will not work. Please use the branch dropdown.
          </p>
        )}
      </div>
    );
  }

  return <ExecutionMessage {...props} />;
}

type ExecutionProps = {
  rowsLen: number;
  params: SqlQueryParams;
};

export function ExecutionMessage(props: ExecutionProps) {
  const { isDolt } = useDatabaseDetails(props.params.connectionName);
  return (
    <p className={css.status}>
      {props.rowsLen} {pluralize(props.rowsLen, "row")} selected
      {isDolt && (
        <span>
          {" "}
          on <span className={css.bold}>{props.params.refName}</span>
        </span>
      )}
    </p>
  );
}

function BranchMsg(props: { params: SqlQueryParams }) {
  const { branchName, databaseName } = parseQuery(props.params.q);
  return (
    <p>
      Cannot use <code>USE</code> statements to change branches from the
      workbench. Please use the branch dropdown.{" "}
      {branchName && (
        <Link
          {...ref({
            ...props.params,
            databaseName: databaseName ?? props.params.databaseName,
            refName: branchName,
          })}
        >
          Change to &quot;{databaseName ? `${databaseName}/` : ""}
          {branchName}&quot;.
        </Link>
      )}
      <br />
    </p>
  );
}
