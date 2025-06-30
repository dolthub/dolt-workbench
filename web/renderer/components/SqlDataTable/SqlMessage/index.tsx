import { ErrorMsg, isTimeoutError } from "@dolthub/react-components";
import { QueryExecutionStatus } from "@gen/graphql-types";
import useSqlParser from "@hooks/useSqlParser";
import { ApolloErrorType } from "@lib/errors/types";
import { SqlQueryParams } from "@lib/params";
import SuccessMsg from "./SuccessMsg";
import TimeoutMessage from "./TimeoutMsg";
import css from "./index.module.css";
import { improveGqlError } from "./utils";

type TimeoutProps = {
  rowsLen: number;
  params: SqlQueryParams;
};

type Props = TimeoutProps & {
  gqlError?: ApolloErrorType;
  executionStatus?: QueryExecutionStatus;
  executionMessage?: string;
};

export default function SqlMessage(props: Props) {
  const { isMultipleQueries } = useSqlParser();
  if (props.gqlError) {
    if (
      isTimeoutError(props.gqlError.message) ||
      props.gqlError.message === ""
    ) {
      return <TimeoutMessage {...props} />;
    }
    return (
      <ErrorMsg
        className={css.status}
        errString={
          improveGqlError(props.gqlError)?.message || "INTERNAL_SERVER_ERROR"
        }
      />
    );
  }

  switch (props.executionStatus) {
    case QueryExecutionStatus.Success:
      return <SuccessMsg {...props} />;
    case QueryExecutionStatus.Timeout:
      return <TimeoutMessage {...props} />;
    case QueryExecutionStatus.Error:
    default:
      if (props.executionMessage && isTimeoutError(props.executionMessage)) {
        return <TimeoutMessage {...props} />;
      }
      if (isMultipleQueries(props.params.q)) {
        return (
          <ErrorMsg errString="The SQL workbench doesn't support multiple queries" />
        );
      }
      return (
        <ErrorMsg className={css.status} errString={props.executionMessage} />
      );
  }
}
