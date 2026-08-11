import { isTimeoutError } from "@dolthub/react-components";
import { QueryExecutionStatus } from "@gen/graphql-types";
import { ApolloErrorType } from "@lib/errors/types";
import { SqlQueryParams } from "@lib/params";
import SuccessMsg from "./SuccessMsg";
import TimeoutMessage from "./TimeoutMsg";

type TimeoutProps = {
  rowsLen: number;
  params: SqlQueryParams;
};

type Props = TimeoutProps & {
  gqlError?: ApolloErrorType;
  executionStatus?: QueryExecutionStatus;
  executionMessage?: string;
  isMutation?: boolean;
};

export default function SqlMessage(props: Props) {
  if (props.gqlError) {
    if (
      isTimeoutError(props.gqlError.message) ||
      props.gqlError.message === ""
    ) {
      return <TimeoutMessage {...props} />;
    }
    return null;
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
      return null;
  }
}
