import Page from "@components/util/Page";
import { DatabaseParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: DatabaseParams & {
    active?: string;
  };
};

const DefaultBranchAndDocPage: NextPage<Props> = ({ params }) => (
  <Page title={`Database ${params.databaseName} - Doc`}>
    <DatabasePage.ForDocs params={params} title="doc" />
  </Page>
);

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  return {
    props: {
      params: {
        ...(params as DatabaseParams),
        active: query.active ? String(query.active) : "",
      },
    },
  };
};

export default DefaultBranchAndDocPage;
