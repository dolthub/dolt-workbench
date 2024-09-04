import Page from "@components/util/Page";
import { MaybeRefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type Props = {
  params: MaybeRefParams;
};

const DatabaseReleasesPage: NextPage<Props> = ({ params }) => (
  <Page title={`Releases for ${params.databaseName}`} noIndex>
    <DatabasePage.ForReleases
      params={{
        ...params,
        refName: params.refName ?? undefined,
      }}
    />
  </Page>
);

export default DatabaseReleasesPage;
