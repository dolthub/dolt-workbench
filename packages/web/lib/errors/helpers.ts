import { ApolloError } from "@apollo/client";
import { ApolloErrorType } from "./types";

export function errorMatches(
  errString: string,
  err?: ApolloErrorType,
): boolean {
  return !!err?.message.match(errString);
}

export function isTimeoutError(err: string): boolean {
  return (
    err.includes("upstream request timeout") ||
    err.includes("query error: timeout") ||
    err.includes("Unexpected token 'u'") ||
    // Chrome and Edge
    err.includes("Unexpected token u in JSON at position 0") ||
    // Safari
    err.includes(`Unexpected identifier "upstream"`) ||
    // Firefox
    err.includes("unexpected character at line 1 column 1 of the JSON data") ||
    err.includes("Failed to fetch")
  );
}

export function improveErrorMsg(message: string): string {
  if (isTimeoutError(message)) {
    return "Request timed out. Please try again.";
  }

  switch (message) {
    case "":
      return "Error message empty";
    default:
      return message;
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
