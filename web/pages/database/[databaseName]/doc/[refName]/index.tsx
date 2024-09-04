import Page from "@components/util/Page";
import { RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type Props = {
  params: RefParams & {
    active?: string;
  };
};

const RefBranchAndDefaultDocPage: NextPage<Props> = ({ params }) => (
  <Page title={`${params.databaseName} - Docs ${params.refName}`} noIndex>
    <DatabasePage.ForDocs params={params} title="doc" />
  </Page>
);

export default RefBranchAndDefaultDocPage;
