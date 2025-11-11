import { RefOptionalSchemaParams } from "@lib/params";
import useTableNames from "@hooks/useTableNames";
import { Status, useGetStatusQuery } from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import { useEffect, useState } from "react";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";

export type TableNameWithStatus = {
  name: string;
  status: string | undefined;
};

type TableNameWithStatusReturnType = {
  tables?: TableNameWithStatus[];
  loading: boolean;
  error?: ApolloErrorType;
  refetch: () => Promise<void>;
};

export function useTableNamesWithStatus(
  params: RefOptionalSchemaParams,
): TableNameWithStatusReturnType {
  const tableNamesResponse = useTableNames(params);
  const { isDolt } = useDatabaseDetails();

  const statusResponse = useGetStatusQuery({
    variables: { ...params },
    skip: !isDolt,
  });

  const [err, setErr] = useApolloError(statusResponse.error);
  const [tables, setTables] = useState(
    getTables(
      tableNamesResponse.tables,
      isDolt ? (statusResponse.data?.status ?? []) : [],
    ),
  );

  const refetch = async () => {
    try {
      await tableNamesResponse.refetch();
      if (isDolt) {
        const newStatusResponse = await statusResponse.refetch({ ...params });
        setTables(
          getTables(tableNamesResponse.tables, newStatusResponse.data.status),
        );
      } else {
        setTables(getTables(tableNamesResponse.tables, []));
      }
    } catch (e) {
      handleCaughtApolloError(e, setErr);
    }
  };

  useEffect(() => {
    setTables(
      getTables(
        tableNamesResponse.tables,
        isDolt ? (statusResponse.data?.status ?? []) : [],
      ),
    );
  }, [tableNamesResponse.tables, statusResponse.data, setTables, isDolt]);

  return {
    tables,
    loading: tableNamesResponse.loading || (isDolt && statusResponse.loading),
    error: err,
    refetch,
  };
}

function getTables(
  tableNames: string[] | undefined,
  statusList: Status[],
): TableNameWithStatus[] {
  if (!tableNames) {
    return [];
  }
  return tableNames.map(tableName => {
    return {
      name: tableName,
      status: statusList.find(status => status.tableName === tableName)?.status,
    };
  });
}
