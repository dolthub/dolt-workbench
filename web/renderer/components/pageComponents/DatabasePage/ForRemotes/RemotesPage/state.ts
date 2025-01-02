import { ApolloErrorType } from "@lib/errors/types";

export const defaultState = {
  message: "",
  err: undefined as ApolloErrorType,
  loading: false,
  branchName: "",
};

export type PushToRemoteState = typeof defaultState;

export function getDefaultState(branchName: string): PushToRemoteState {
  return {
    ...defaultState,
    branchName,
  };
}
