import { ApolloErrorType } from "@lib/errors/types";

type RevisionInfo = {
  databaseName?: string;
  branchName?: string;
};

export function parseQuery(q: string): RevisionInfo {
  const lower = q.toLowerCase();
  if (
    lower.includes("call dolt_checkout") ||
    lower.includes("select dolt_checkout")
  ) {
    return parseDoltCheckoutQuery(q);
  }
  if (lower.startsWith("use ")) {
    return parseUseQuery(q);
  }
  return { databaseName: undefined, branchName: undefined };
}

// Parse string "use `<databaseName>/<branchName>`" into { databaseName: <databaseName>, branchName: <branchName> }
function parseUseQuery(q: string): RevisionInfo {
  const lower = q.toLowerCase();
  const split = q.split(" ");
  const rev = split[1];
  if (!lower.includes("`")) {
    return { databaseName: rev, branchName: undefined };
  }
  const removedTicks = rev.split("`")[1];
  if (!lower.includes("/")) {
    return { databaseName: removedTicks, branchName: undefined };
  }
  const [databaseName, ...branchNameParts] = removedTicks.split("/");
  return { databaseName, branchName: branchNameParts.join("/") };
}

// Parse string "dolt_checkout('<branchName>')"|"dolt_checkout('-b', '<branchName>')" into { branchName: <branchName> }
function parseDoltCheckoutQuery(q: string): RevisionInfo {
  const lower = q.toLowerCase();
  const split = lower.split(/'|"/);
  const branchName = split[1];
  if (branchName === "-b") return { branchName: split[3] };
  return { branchName };
}

export function isReadOnlyDatabaseRevisionError(err: ApolloErrorType): boolean {
  return !!err?.message.match(/Database .+\/.+ is read-only./g);
}

export function improveGqlError(err: ApolloErrorType): ApolloErrorType {
  if (!err) return err;
  if (isReadOnlyDatabaseRevisionError(err)) {
    // eslint-disable-next-line no-param-reassign
    err.message = `${err.message}
You may see this error if a tag is selected from the left branch/tag dropdown. Please select a branch to make changes to this database.`;
  }
  return err;
}
