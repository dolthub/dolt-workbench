import Page from "@components/util/Page";
import { RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type Props = {
  params: RefParams & { active?: string };
};

const SchemaPage: NextPage<Props> = ({ params }) => (
  <Page title={`${params.databaseName} - Schema`} noIndex>
    <DatabasePage.ForSchema params={params} />
  </Page>
);

export default SchemaPage;
