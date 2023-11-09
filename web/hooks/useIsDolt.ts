import { useDoltDatabaseDetailsQuery } from "@gen/graphql-types";
import { ApolloErrorType } from "@lib/errors/types";

type ReturnType = {
  isDolt: boolean;
  disableDoltFeature: boolean;
  hideDoltFeature: boolean;
  loading: boolean;
  error?: ApolloErrorType;
};

export default function useIsDolt(): ReturnType {
  const res = useDoltDatabaseDetailsQuery();
  const isDolt = res.data?.doltDatabaseDetails.isDolt ?? false;
  const hideDolt = res.data?.doltDatabaseDetails.hideDoltFeatures ?? false;

  return {
    isDolt,
    disableDoltFeature: !isDolt && !hideDolt,
    hideDoltFeature: !isDolt && hideDolt,
    loading: res.loading,
    error: res.error,
  };
}
