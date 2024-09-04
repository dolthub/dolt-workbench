import Page from "@components/util/Page";
import { RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type Props = {
  params: RefParams;
};

const DatabaseCommitsPage: NextPage<Props> = ({ params }) => (
  <Page title={`Commit log for ${params.databaseName}`} noIndex>
    <DatabasePage.ForCommits params={params} />
  </Page>
);

export default DatabaseCommitsPage;
