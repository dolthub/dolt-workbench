import Loader from "@components/Loader";
import useTableNames from "@hooks/useTableNames";
import { RefParams } from "@lib/params";
import ForEmpty from "../ForEmpty";
import ForError from "../ForError";
import ForTable from "../ForTable";

type Props = {
  params: RefParams;
};

export default function ForRef({ params }: Props) {
  const { tables, error, loading } = useTableNames();

  if (loading) return <Loader loaded={!loading} />;

  if (error) return <ForError error={error} params={params} />;

  if (!tables?.length) return <ForEmpty params={params} />;

  return <ForTable params={{ ...params, tableName: tables[0] }} />;
}
