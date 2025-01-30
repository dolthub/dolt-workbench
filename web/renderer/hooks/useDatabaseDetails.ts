import { DatabaseType, useDoltDatabaseDetailsQuery } from "@gen/graphql-types";
import { ApolloErrorType } from "@lib/errors/types";

type ReturnType = {
  isDolt: boolean;
  isPostgres: boolean;
  disableDoltFeature: boolean;
  hideDoltFeature: boolean;
  loading: boolean;
  error?: ApolloErrorType;
};

export default function useDatabaseDetails(connectionName: string): ReturnType {
  const res = useDoltDatabaseDetailsQuery({
    variables: { name: connectionName },
  });
  const isDolt = res.data?.doltDatabaseDetails.isDolt ?? false;
  const isPostgres =
    res.data?.doltDatabaseDetails.type === DatabaseType.Postgres;
  const hideDolt = res.data?.doltDatabaseDetails.hideDoltFeatures ?? false;

  return {
    isDolt,
    isPostgres,
    disableDoltFeature: !isDolt && !hideDolt,
    hideDoltFeature: !isDolt && hideDolt,
    loading: res.loading,
    error: res.error,
  };
}
