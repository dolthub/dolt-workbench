import DatabasePage from "@components/pageComponents/DatabasePage";
import Page from "@components/util/Page";
import { RefParams } from "@lib/params";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: RefParams;
};

const DatabaseCommitGraphPage: NextPage<Props> = ({ params }) => (
  <Page title={`Commit graph for ${params.databaseName}`} noIndex>
    <DatabasePage.ForCommitGraph params={params} />
  </Page>
);

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
}) => {
  return {
    props: { params: params as RefParams },
  };
};

export default DatabaseCommitGraphPage;
