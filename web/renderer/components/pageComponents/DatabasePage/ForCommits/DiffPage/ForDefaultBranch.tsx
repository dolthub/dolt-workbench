import { Loader } from "@dolthub/react-components";
import { useDefaultBranchPageQuery } from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";
import ForEmpty from "../../ForEmpty";
import ForBranch from "./ForBranch";

type Props = {
  params: DatabaseParams;
};

export default function ForDefaultBranch(props: Props) {
  const { data, loading } = useDefaultBranchPageQuery({
    variables: { ...props.params, name: props.params.connectionName },
  });
  if (loading) return <Loader loaded={false} />;
  const refName = data?.defaultBranch?.branchName;

  if (!refName) {
    return <ForEmpty params={props.params} />;
  }
  return <ForBranch params={{ ...props.params, refName }} />;
}
