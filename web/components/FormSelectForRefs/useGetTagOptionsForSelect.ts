import { FormSelectTypes } from "@dolthub/react-components";
import { useTagListQuery } from "@gen/graphql-types";
import { ApolloErrorType } from "@lib/errors/types";
import { DatabaseParams } from "@lib/params";

type ReturnType = {
  tagOptions: Array<FormSelectTypes.Option<string>>;
  error?: ApolloErrorType;
  loading: boolean;
};

export default function useGetTagOptionsForSelect(
  params: DatabaseParams,
): ReturnType {
  const tagRes = useTagListQuery({ variables: params });

  const tagOptions =
    tagRes.data?.tags.list.map(t => {
      return {
        value: t.tagName,
        label: t.tagName,
      };
    }) ?? [];

  return { tagOptions, error: tagRes.error, loading: tagRes.loading };
}
