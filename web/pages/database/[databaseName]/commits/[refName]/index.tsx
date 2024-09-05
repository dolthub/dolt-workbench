import Page from "@components/util/Page";
import { RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: RefParams;
};

const DatabaseCommitsPage: NextPage<Props> = ({ params }) => (
  <Page title={`Commit log for ${params.databaseName}`} noIndex>
    <DatabasePage.ForCommits params={params} />
  </Page>
);

// #!if isWeb
export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
}) => {
  return {
    props: { params: params as RefParams },
  };
};
// #!endif

export default DatabaseCommitsPage;
