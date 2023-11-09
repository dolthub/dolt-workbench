import { gqlPullHasConflicts } from "@lib/errors/graphql";
import { errorMatches, isTimeoutError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";

type MergeError = {
  isConflictsErr: boolean;
  isTimeoutErr: boolean;
  improvedErr: string | undefined;
};

export function improveError(err?: ApolloErrorType): MergeError {
  if (!err) {
    return {
      isConflictsErr: false,
      isTimeoutErr: false,
      improvedErr: undefined,
    };
  }
  if (errorMatches(gqlPullHasConflicts, err)) {
    return {
      isConflictsErr: true,
      isTimeoutErr: false,
      improvedErr: undefined,
    };
  }
  if (isTimeoutError(err.message)) {
    return {
      isConflictsErr: false,
      isTimeoutErr: true,
      improvedErr: undefined,
    };
  }
  return {
    isConflictsErr: false,
    isTimeoutErr: false,
    improvedErr: err.message,
  };
}
