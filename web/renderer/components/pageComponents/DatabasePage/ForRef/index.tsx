import { NetworkStatus } from "@apollo/client";
import { Loader } from "@dolthub/react-components";
import { useRefPageQuery } from "@gen/graphql-types";
import { RefOptionalSchemaParams } from "@lib/params";
import ForEmpty from "../ForEmpty";
import ForError from "../ForError";
import ForTable from "../ForTable";

type Props = {
  params: RefOptionalSchemaParams;
};

export default function ForRef({ params }: Props) {
  const res = useRefPageQuery({
    variables: {
      databaseName: params.databaseName,
      refName: params.refName,
      schemaName: params.schemaName,
      filterSystemTables: true,
    },
  });
  const data =
    res.data ??
    (res.networkStatus === NetworkStatus.refetch
      ? res.previousData
      : undefined);

  if (res.loading && !data) return <Loader loaded={false} />;

  if (res.error) return <ForError error={res.error} params={params} />;

  if (!data?.tableNames.list.length) return <ForEmpty params={params} />;

  return (
    <ForTable params={{ ...params, tableName: data.tableNames.list[0] }} />
  );
}
