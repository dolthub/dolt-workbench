import Page from "@components/util/Page";
import { RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type Props = {
  params: RefParams & {
    active?: string;
  };
};

const RefPage: NextPage<Props> = ({ params }) => (
  <Page title={`${params.databaseName} - ${params.refName}`} noIndex>
    <DatabasePage.ForRef params={params} />
  </Page>
);

export default RefPage;
