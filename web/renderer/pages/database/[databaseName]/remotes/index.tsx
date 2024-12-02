import Page from "@components/util/Page";
import { DatabaseParams, MaybeRefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: MaybeRefParams;
};

const DatabaseRemotesPage: NextPage<Props> = ({ params }) => (
  <Page title={`Remotes for ${params.databaseName}`} noIndex>
    <DatabasePage.ForRemotes
      params={{
        ...params,
        refName: params.refName ?? undefined,
      }}
    />
  </Page>
);

// #!if !isElectron
export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  return {
    props: {
      params: {
        ...(params as DatabaseParams),
        refName: query.refName ? String(query.refName) : null,
      },
    },
  };
};
// #!endif

export default DatabaseRemotesPage;
