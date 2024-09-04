import Page from "@components/util/Page";
import { MaybeRefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type Props = {
  params: MaybeRefParams;
};

const DatabaseNewReleasePage: NextPage<Props> = ({ params }) => (
  <Page title={`New release for ${params.databaseName}`} noIndex>
    <DatabasePage.ForReleases
      params={{ ...params, refName: params.refName ?? undefined }}
      newRelease
    />
  </Page>
);

export default DatabaseNewReleasePage;
