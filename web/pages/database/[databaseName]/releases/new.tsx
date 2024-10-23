import Page from "@components/util/Page";
import { DatabaseParams, MaybeRefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: MaybeRefParams;
};

const DatabaseNewReleasePage: NextPage<Props> = ({ params }) => (
  <Page title={`New release for ${params.databaseName}`} noIndex>
    <DatabasePage.ForReleases
      params={{ ...params, refName: params.refName ?? undefined }}
      newRelease
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

export default DatabaseNewReleasePage;
