import { ApolloError } from "@apollo/client";
import { gqlDatabasesDoNotMatch } from "./graphql";
import { ApolloErrorType, ErrorType } from "./types";

export function errorMatches(
  errString: string,
  err?: ApolloErrorType,
): boolean {
  return !!err?.message.match(errString);
}

export function improveErrorMsg(message: string): string {
  switch (message) {
    case "":
      return "Error message empty";
    case "Server does not support secure connnection":
      return "Server does not support secure connection. See advanced settings to disable SSL.";
    case gqlDatabasesDoNotMatch:
      return "Current database does not match selected database. Choose a database from the database dropdown in the top navigation to proceed.";
    default:
      return message;
  }
}

export function handleCaughtError(err: unknown, cb: (e: ErrorType) => void) {
  if (err instanceof Error) {
    cb(err);
  } else {
    cb(new Error(String(err)));
  }
}

export function getCaughtApolloError(err: unknown): ApolloErrorType {
  if (err instanceof ApolloError) {
    return err;
  }
  if (err instanceof Error) {
    return err;
  }
  return new Error(String(err));
}

export function handleCaughtApolloError(
  err: unknown,
  cb: (e: ApolloErrorType) => void,
) {
  cb(getCaughtApolloError(err));
}
