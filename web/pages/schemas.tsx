import SchemasPage from "@components/pageComponents/SchemasPage";
import Page from "@components/util/Page";
import { NextPage } from "next";

const ChooseSchemaPage: NextPage = () => (
  <Page title="Choose a schema">
    <SchemasPage />
  </Page>
);

export default ChooseSchemaPage;
