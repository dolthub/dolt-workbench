import Page from "@components/util/Page";
import { MaybeRefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type Props = {
  params: MaybeRefParams & {
    schemaName?: string;
    active?: string;
    edit?: boolean;
  };
};

const CreateTablePage: NextPage<Props> = ({ params }) => (
  <Page title={`${params.databaseName} - Create table`} noIndex>
    <DatabasePage.ForCreateTable params={params} />
  </Page>
);

export default CreateTablePage;
