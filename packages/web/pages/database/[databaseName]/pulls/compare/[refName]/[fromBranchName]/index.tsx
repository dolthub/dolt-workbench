import Page from "@components/util/Page";
import Maybe from "@lib/Maybe";
import { RequiredPullDiffParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: RequiredPullDiffParams;
  tableName?: Maybe<string>;
};

const PullDiffPage: NextPage<Props> = ({ params, tableName }) => (
  <Page title={`Viewing pull diff for ${params.databaseName}`} noIndex>
    <DatabasePage.ForPullDiff
      params={{
        databaseName: params.databaseName,
        fromBranchName: params.fromBranchName,
        refName: params.refName,
      }}
      tableName={tableName ?? undefined}
    />
  </Page>
);

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  return {
    props: {
      params: params as RequiredPullDiffParams,
      tableName: query.tableName ? String(query.tableName) : null,
    },
  };
};

export default PullDiffPage;
