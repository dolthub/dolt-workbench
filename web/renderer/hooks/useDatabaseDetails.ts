import { DatabaseType, useDoltDatabaseDetailsQuery } from "@gen/graphql-types";
import { ApolloErrorType } from "@lib/errors/types";

type ReturnType = {
  isDolt: boolean;
  isPostgres: boolean;
  isMysql: boolean;
  disableDoltFeature: boolean;
  hideDoltFeature: boolean;
  loading: boolean;
  error?: ApolloErrorType;
};

export default function useDatabaseDetails(): ReturnType {
  const res = useDoltDatabaseDetailsQuery();
  const isDolt = res.data?.doltDatabaseDetails.isDolt ?? false;
  const isPostgres =
    res.data?.doltDatabaseDetails.type === DatabaseType.Postgres;
  const isMysql = res.data?.doltDatabaseDetails.type === DatabaseType.Mysql;
  const hideDolt = res.data?.doltDatabaseDetails.hideDoltFeatures ?? false;

  return {
    isDolt,
    isPostgres,
    isMysql,
    disableDoltFeature: !isDolt && !hideDolt,
    hideDoltFeature: !isDolt && hideDolt,
    loading: res.loading,
    error: res.error,
  };
}
