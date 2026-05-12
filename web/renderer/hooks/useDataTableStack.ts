import { useDataTableContext } from "@contexts/dataTable";
import {
  StackingParams,
  parseStackingParams,
  pushStack,
} from "@lib/dataTableParams";
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";

type Result = {
  stack: StackingParams;
  update: (next: StackingParams) => void;
};

export default function useDataTableStack(): Result {
  const router = useRouter();
  const { columns } = useDataTableContext();
  const orderByParam = router.query.orderBy;
  const whereParam = router.query.where;
  const hideParam = router.query.hide;
  const projectionParam = router.query.projection;

  const stack = useMemo(
    () => parseStackingParams(router.query, columns ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderByParam, whereParam, hideParam, projectionParam, columns],
  );

  const update = useCallback(
    (next: StackingParams) => pushStack(router, next),
    [router],
  );

  return { stack, update };
}
