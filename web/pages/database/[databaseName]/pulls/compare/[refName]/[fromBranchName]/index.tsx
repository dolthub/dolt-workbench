import Page from "@components/util/Page";
import { Maybe } from "@dolthub/web-utils";
import { PullDiffParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type Props = {
  params: PullDiffParams;
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

export default PullDiffPage;
