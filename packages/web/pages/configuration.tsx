import ConfigurationPage from "@components/pageComponents/ConfigurationPage";
import Page from "@components/util/Page";
import { NextPage } from "next";

const Configuration: NextPage = () => (
  <Page title="Add MySQL Configuration">
    <ConfigurationPage />
  </Page>
);

export default Configuration;
