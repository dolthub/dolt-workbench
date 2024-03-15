import { FormSelectTypes } from "@dolthub/react-components";
import { useTagListQuery } from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";

type ReturnType = {
  tagOptions: Array<FormSelectTypes.Option<string>>;
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

  return { tagOptions };
}
