import Page from "@components/util/Page";
import { Maybe } from "@dolthub/web-utils";
import { MaybeRefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type Props = {
  params: MaybeRefParams & {
    from?: Maybe<string>;
  };
};

const PullsPage: NextPage<Props> = ({ params }) => (
  <Page title={`Viewing pulls for ${params.databaseName}`} noIndex>
    <DatabasePage.ForPulls
      params={{
        databaseName: params.databaseName,
        refName: params.refName ?? undefined,
        fromBranchName: params.from ?? undefined,
      }}
    />
  </Page>
);

export default PullsPage;
