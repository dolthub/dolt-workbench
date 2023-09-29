import { ApolloErrorType, SetApolloErrorType } from "@lib/errors/types";
import tuplify from "@lib/tuplify";
import { useEffect, useState } from "react";

type ReturnType = [ApolloErrorType, SetApolloErrorType];

export default function useApolloError(error?: ApolloErrorType): ReturnType {
  const [err, setErr] = useState(error);
  useEffect(() => {
    setErr(error);
  }, [error]);
  return tuplify(err, setErr);
}
