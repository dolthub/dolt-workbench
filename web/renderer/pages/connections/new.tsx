import NewConnection from "@components/pageComponents/ConnectionsPage/NewConnection";
import Page from "@components/util/Page";
import { NextPage } from "next";

const AddConnection: NextPage = () => (
  <Page title="Add SQL Connection">
    <NewConnection />
  </Page>
);

export default AddConnection;
