import DatabasePage from "@components/pageComponents/DatabasePage";
import Page from "@components/util/Page";
import { RefParams } from "@lib/params";
import { NextPage } from "next";

type Props = {
  params: RefParams;
};

const DatabaseCommitGraphPage: NextPage<Props> = ({ params }) => (
  <Page title={`Commit graph for ${params.databaseName}`} noIndex>
    <DatabasePage.ForCommitGraph params={params} />
  </Page>
);

export default DatabaseCommitGraphPage;
