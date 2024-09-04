import Page from "@components/util/Page";
import { MaybeRefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type Props = {
  params: MaybeRefParams;
};

const DatabaseBranchesPage: NextPage<Props> = ({ params }) => (
  <Page title={`Branches for ${params.databaseName}`} noIndex>
    <DatabasePage.ForBranches
      params={{
        ...params,
        refName: params.refName ?? undefined,
      }}
    />
  </Page>
);

export default DatabaseBranchesPage;
