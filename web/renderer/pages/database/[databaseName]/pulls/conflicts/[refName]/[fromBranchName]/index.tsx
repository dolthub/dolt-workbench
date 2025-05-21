import Page from "@components/util/Page";
import { PullDiffParams, PullDiffParamsOptionalTableName } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: PullDiffParamsOptionalTableName;
};

const PullConflictsPage: NextPage<Props> = ({ params }) => (
  <Page title={`Viewing pull conflicts for ${params.databaseName}`} noIndex>
    <DatabasePage.ForPullConflicts
      params={{
        databaseName: params.databaseName,
        fromBranchName: params.fromBranchName,
        refName: params.refName,
      }}
      tableName={params.tableName || undefined}
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
        ...(params as PullDiffParams),
        tableName: query.tableName ? String(query.tableName) : null,
      },
    },
  };
};
// #!endif

export default PullConflictsPage;
