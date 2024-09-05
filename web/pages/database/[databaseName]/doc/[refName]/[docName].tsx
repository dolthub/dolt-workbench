import Page from "@components/util/Page";
import { DocParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

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

// #!if isWeb
export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  return {
    props: {
      params: {
        ...(params as DocParams),
        active: query.active ? String(query.active) : "",
      },
    },
  };
};
// #!endif

export default BranchAndDocPage;
