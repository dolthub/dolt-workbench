import Page from "@components/util/Page";
import { DatabaseParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: DatabaseParams;
};

const DatabaseNewRemotePage: NextPage<Props> = ({ params }) => (
  <Page title={`New remote for ${params.databaseName}`} noIndex>
    <DatabasePage.ForRemotes params={params} newRemote />
  </Page>
);

// #!if !isElectron
export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
}) => {
  return {
    props: {
      params: params as DatabaseParams,
    },
  };
};
// #!endif

export default DatabaseNewRemotePage;
