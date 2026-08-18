import { DatabaseType, useDoltDatabaseDetailsQuery } from "@gen/graphql-types";
import { ApolloErrorType } from "@lib/errors/types";

type ReturnType = {
  databaseType?: DatabaseType;
  isDolt: boolean;
  isPostgres: boolean;
  isSqlite: boolean;
  disableDoltFeature: boolean;
  hideDoltFeature: boolean;
  loading: boolean;
  hasData: boolean;
  error?: ApolloErrorType;
};

export default function useDatabaseDetails(): ReturnType {
  const res = useDoltDatabaseDetailsQuery();
  const databaseType = res.data?.doltDatabaseDetails.type;
  const isDolt = res.data?.doltDatabaseDetails.isDolt ?? false;
  const isPostgres =
    res.data?.doltDatabaseDetails.type === DatabaseType.Postgres;
  const isSqlite = res.data?.doltDatabaseDetails.type === DatabaseType.Sqlite;
  const hideDolt = res.data?.doltDatabaseDetails.hideDoltFeatures ?? false;

  return {
    databaseType,
    isDolt,
    isPostgres,
    isSqlite,
    disableDoltFeature: !isDolt && !hideDolt,
    hideDoltFeature: !isDolt && hideDolt,
    loading: res.loading,
    hasData: !!res.data,
    error: res.error,
  };
}
