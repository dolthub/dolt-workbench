import { Loader } from "@dolthub/react-components";
import { useRefPageQuery } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import ForEmpty from "../ForEmpty";
import ForError from "../ForError";
import ForTable from "../ForTable";

type Props = {
  params: RefParams;
};

export default function ForRef({ params }: Props) {
  const { data, error, loading } = useRefPageQuery({
    variables: { ...params, filterSystemTables: true },
  });

  if (loading) return <Loader loaded={!loading} />;

  if (error) return <ForError error={error} params={params} />;

  if (!data?.tableNames.list.length) return <ForEmpty params={params} />;

  return (
    <ForTable params={{ ...params, tableName: data.tableNames.list[0] }} />
  );
}
