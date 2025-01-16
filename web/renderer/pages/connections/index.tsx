import ConnectionsPage from "@components/pageComponents/ConnectionsPage";
import Page from "@components/util/Page";
import { NextPage } from "next";

const Connections: NextPage = () => (
  <Page title="SQL Connections">
    <ConnectionsPage />
  </Page>
);

export default Connections;
