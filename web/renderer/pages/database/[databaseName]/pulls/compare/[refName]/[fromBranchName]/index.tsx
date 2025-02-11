import Page from "@components/util/Page";
import { PullDiffParamsOptionalTableName } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: PullDiffParamsOptionalTableName;
};

const PullDiffPage: NextPage<Props> = ({ params }) => (
  <Page title={`Viewing pull diff for ${params.databaseName}`} noIndex>
    <DatabasePage.ForPullDiff
      params={{
        databaseName: params.databaseName,
        fromBranchName: params.fromBranchName,
        refName: params.refName,
      }}
      tableName={params.tableName}
    />
  </Page>
);

// #!if !isElectron
export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  return {
    props: {
      params: {
        ...params,
        tableName: query.tableName ? String(query.tableName) : null,
      } as PullDiffParamsOptionalTableName,
    },
  };
};
// #!endif

export default PullDiffPage;
