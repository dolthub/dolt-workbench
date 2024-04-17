import { useSetState } from "@dolthub/react-hooks";
import { Maybe } from "@dolthub/web-utils";
import { useCreateTagMutation } from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { UserHeaders, useUserHeaders } from "@hooks/useUserHeaders";
import { ApolloErrorType } from "@lib/errors/types";
import { DatabaseParams } from "@lib/params";
import { refetchTagQueries } from "@lib/refetchQueries";
import { Dispatch, useState } from "react";

type FormData = {
  tagName: string;
  message: string;
  fromRefName: Maybe<string>;
  addTagAuthor: boolean;
};

type ReturnType = {
  // Returns the created tag if successful
  createTag: () => Promise<string | undefined>;
  creationErr: ApolloErrorType;
  loading: boolean;
  canCreateTag: boolean;
  formData: FormData;
  setFormData: Dispatch<Partial<FormData>>;
  userHeaders: UserHeaders | null;
};

// A helper function to create a tag using a specific revision type
export default function useCreateTag(params: DatabaseParams): ReturnType {
  const userHeaders = useUserHeaders();
  const [formData, setFormData] = useSetState({
    tagName: "",
    message: "",
    fromRefName: null as Maybe<string>,
    addTagAuthor: !!(userHeaders?.user && userHeaders?.email),
  });
  const [loading, setLoading] = useState(false);

  const canCreateTag = !!formData.tagName && !!formData.fromRefName;

  const { mutateFn: createTagMutation, err: creationErr } = useMutation({
    hook: useCreateTagMutation,
    refetchQueries: refetchTagQueries(params),
  });

  const createTag = async (): Promise<string | undefined> => {
    if (!formData.fromRefName) return undefined;
    setLoading(true);
    try {
      const { data } = await createTagMutation({
        variables: {
          ...params,
          tagName: formData.tagName,
          message: formData.message,
          fromRefName: formData.fromRefName,
          author:
            formData.addTagAuthor && userHeaders?.user && userHeaders?.email
              ? {
                  name: userHeaders.user,
                  email: userHeaders.email,
                }
              : undefined,
        },
      });
      return data?.createTag;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTag,
    creationErr,
    loading,
    canCreateTag,
    formData,
    setFormData,
    userHeaders,
  };
}
