import DatabasePage from "@components/pageComponents/DatabasePage";
import Page from "@components/util/Page";
import { DatabaseParams } from "@lib/params";
import { database } from "@lib/urls";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: DatabaseParams & {
    active?: string;
  };
};

const DefaultBranch: NextPage<Props> = ({ params }) => (
  <Page title={`Database - ${params.databaseName}`}>
    <DatabasePage.ForDefaultBranch
      params={params}
      routeRefChangeTo={database}
    />
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
        ...(params as DatabaseParams),
        active: query.active ? String(query.active) : "",
      },
    },
  };
};
// #!endif

export default DefaultBranch;
