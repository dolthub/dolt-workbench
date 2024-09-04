import Page from "@components/util/Page";
import { RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type Props = {
  params: RefParams;
};

const RefBranchAndDefaultDocPage: NextPage<Props> = ({ params }) => (
  <Page title={`${params.databaseName} - New Doc`} noIndex>
    <DatabasePage.ForDocs params={params} new />
  </Page>
);

export default RefBranchAndDefaultDocPage;
