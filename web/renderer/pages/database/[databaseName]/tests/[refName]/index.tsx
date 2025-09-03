import Page from "@components/util/Page";
import { RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: RefParams;
};

const DatabaseTestsPage: NextPage<Props> = ({ params }) => (
  <Page title={`Tests for ${params.databaseName}/${params.refName}`} noIndex>
    <DatabasePage.ForTests
      params={{
        ...params,
        refName: params.refName,
      }}
    />
  </Page>
);

// #!if !isElectron
export const getServerSideProps: GetServerSideProps<Props> = async ({
                                                                      params,
                                                                    }) => {
  return {
    props: { params: params as RefParams },
  };
};

// #!endif

export default DatabaseTestsPage;
