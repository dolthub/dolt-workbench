import {
  ApolloCache,
  ApolloClient,
  DefaultContext,
  FetchResult,
  MutationFunctionOptions,
  MutationHookOptions,
  MutationTuple,
  NormalizedCacheObject,
} from "@apollo/client";
import { GraphQLError } from "graphql";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType, SetApolloErrorType } from "@lib/errors/types";
import { RefetchQueries } from "@lib/refetchQueries";
import useApolloError from "./useApolloError";

type ImproveErrFn = ((e: ApolloErrorType) => ApolloErrorType) | undefined;

type Args<TData, TVariables> = {
  hook: (
    baseOptions?: MutationHookOptions<TData, TVariables> | undefined,
  ) => MutationTuple<TData, TVariables>;
  refetchQueries?: RefetchQueries;
  improveErr?: ImproveErrFn;
};

export type MutationResultType<TData, TVariables> = {
  loading: boolean;
  err: ApolloErrorType;
  setErr: SetApolloErrorType;
  called: boolean;
  mutateFn: (
    options?: MutationFunctionOptions<TData, TVariables> | undefined,
  ) => Promise<FetchResult<TData, Record<string, any>, Record<string, any>>>;
  client: ApolloClient<object>;
};

export default function useMutation<TData, TVariables>({
  hook,
  refetchQueries,
  improveErr,
}: Args<TData, TVariables>): MutationResultType<TData, TVariables> {
  const [fn, { error, loading, called, client }] = hook({ refetchQueries });
  const [err, setErr] = useApolloError(handleErr(error, improveErr));
  const mutateFn = async (
    options?: MutationFunctionOptions<
      TData,
      TVariables,
      DefaultContext,
      ApolloCache<NormalizedCacheObject>
    >,
  ): Promise<FetchResult<TData, Record<string, any>, Record<string, any>>> => {
    try {
      return await fn(options);
    } catch (e) {
      handleCaughtApolloError(e, er => setErr(handleErr(er, improveErr)));
      // Should not be used to render error, but to check if error exists
      const gqlErr =
        e instanceof Error ? [new GraphQLError(e.message)] : undefined;
      return { data: undefined, errors: gqlErr };
    }
  };
  return { loading, called, mutateFn, err, setErr, client };
}

function handleErr(err?: ApolloErrorType, fn?: ImproveErrFn): ApolloErrorType {
  if (fn) {
    return fn(err);
  }
  return err;
}
