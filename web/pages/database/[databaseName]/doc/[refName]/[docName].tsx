import Page from "@components/util/Page";
import { DocParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type Props = {
  params: DocParams & {
    active?: string;
  };
};

const BranchAndDocPage: NextPage<Props> = ({ params }) => (
  <Page title={`${params.databaseName} - ${params.docName}`} noIndex>
    <DatabasePage.ForDocs params={params} title="doc" />
  </Page>
);

export default BranchAndDocPage;
