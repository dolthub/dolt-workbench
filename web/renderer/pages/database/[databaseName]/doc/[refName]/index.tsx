import Page from "@components/util/Page";
import { RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

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

// #!if isWeb
export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  return {
    props: {
      params: {
        ...(params as RefParams),
        active: query.active ? String(query.active) : "",
      },
    },
  };
};
// #!endif

export default RefBranchAndDefaultDocPage;
