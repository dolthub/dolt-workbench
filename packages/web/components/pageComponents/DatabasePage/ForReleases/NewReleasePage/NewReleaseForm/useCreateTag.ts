import { CreateTagMutation, useCreateTagMutation } from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import useSetState from "@hooks/useSetState";
import { ApolloErrorType } from "@lib/errors/types";
import { DatabaseParams } from "@lib/params";
import { refetchTagQueries } from "@lib/refetchQueries";
import { Dispatch, useState } from "react";

type FormData = {
  tagName: string;
  message: string;
  fromRefName: string;
  addTagAuthor: boolean;
};

type ReturnType = {
  // Returns the created tag if successful
  createTag: () => Promise<CreateTagMutation | null | undefined>;
  creationErr: ApolloErrorType;
  loading: boolean;
  canCreateTag: boolean;
  formData: FormData;
  setFormData: Dispatch<Partial<FormData>>;
};

// A helper function to create a tag using a specific revision type
export default function useCreateTag(params: DatabaseParams): ReturnType {
  const [formData, setFormData] = useSetState({
    tagName: "",
    message: "",
    fromRefName: "",
    addTagAuthor: false,
  });
  const [loading, setLoading] = useState(false);

  const canCreateTag = !!formData.tagName && !!formData.fromRefName;

  const { mutateFn: createTagMutation, err: creationErr } = useMutation({
    hook: useCreateTagMutation,
    refetchQueries: refetchTagQueries(params),
  });

  const createTag = async (): Promise<CreateTagMutation | null | undefined> => {
    setLoading(true);
    try {
      const { data } = await createTagMutation({
        variables: {
          ...params,
          tagName: formData.tagName,
          message: formData.message,
          fromRefName: formData.fromRefName,
          // author:
          //  formData.addTagAuthor && currentUser
          //    ? {
          //        name: currentUser.username,
          //        email: currentUser.emailAddressesList[0].address,
          //      } :
          //   undefined,
        },
      });
      return data;
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
  };
}
