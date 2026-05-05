import {
  ApolloCache,
  ApolloClient,
  DefaultContext,
  FetchResult,
  MutationFunctionOptions,
  MutationHookOptions,
  MutationTuple,
  MutationUpdaterFunction,
  NormalizedCacheObject,
} from "@apollo/client";
import { getCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType, SetApolloErrorType } from "@lib/errors/types";
import { RefetchQueries } from "@lib/refetchQueries";
import useApolloError from "./useApolloError";

type ImproveErrFn = ((e: ApolloErrorType) => ApolloErrorType) | undefined;

export type MutationArgs<TData, TVariables> = {
  hook: (
    baseOptions?: MutationHookOptions<TData, TVariables> | undefined,
  ) => MutationTuple<TData, TVariables>;
  refetchQueries?: RefetchQueries;
  improveErr?: ImproveErrFn;
  update?:
    | MutationUpdaterFunction<
        TData,
        TVariables,
        DefaultContext,
        ApolloCache<any>
      >
    | undefined;
};

type FnResult<TData> = FetchResult<
  TData,
  Record<string, any>,
  Record<string, any>
> & { success: boolean; error?: ApolloErrorType };

export type MutationResultType<TData, TVariables> = {
  loading: boolean;
  err: ApolloErrorType;
  setErr: SetApolloErrorType;
  called: boolean;
  mutateFn: (
    options?: MutationFunctionOptions<TData, TVariables> | undefined,
  ) => Promise<FnResult<TData>>;
  client: ApolloClient<object>;
};

export default function useMutation<TData, TVariables>({
  hook,
  refetchQueries,
  improveErr,
  update,
}: MutationArgs<TData, TVariables>): MutationResultType<TData, TVariables> {
  const [fn, { error, loading, called, client }] = hook({
    refetchQueries,
    update,
  });
  const [err, setErr] = useApolloError(handleErr(error, improveErr));
  const mutateFn = async (
    options?: MutationFunctionOptions<
      TData,
      TVariables,
      DefaultContext,
      ApolloCache<NormalizedCacheObject>
    >,
  ): Promise<FnResult<TData>> => {
    try {
      const res = await fn(options);
      return { ...res, success: true };
    } catch (e) {
      const normalized = handleErr(getCaughtApolloError(e), improveErr);
      setErr(normalized);
      return { data: undefined, success: false, error: normalized };
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
