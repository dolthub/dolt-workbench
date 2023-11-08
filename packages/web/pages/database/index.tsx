import DatabasesPage from "@components/pageComponents/DatabasesPage";
import Page from "@components/util/Page";
import { NextPage } from "next";

const ChooseDatabasePage: NextPage = () => (
  <Page title="Choose a database">
    <DatabasesPage />
  </Page>
);

export default ChooseDatabasePage;
