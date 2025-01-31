import DatabasesPage from "@components/pageComponents/DatabasesPage";
import Page from "@components/util/Page";
import { ConnectionParams } from "@lib/params";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: ConnectionParams;
};

const ChooseDatabasePage: NextPage<Props> = ({ params }) => (
  <Page title="Choose a database">
    <DatabasesPage params={params} />
  </Page>
);

// #!if !isElectron
export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
}) => {
  return {
    props: {
      params: params as ConnectionParams,
    },
  };
};
// #!endif

export default ChooseDatabasePage;
