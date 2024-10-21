import { ApolloError } from "@apollo/client";
import { Dispatch, SetStateAction } from "react";

export type ErrorType = Error | undefined;
export type ApolloErrorType = ApolloError | ErrorType;
export type SetErrorType = Dispatch<SetStateAction<ErrorType>>;
export type SetApolloErrorType = Dispatch<SetStateAction<ApolloErrorType>>;
