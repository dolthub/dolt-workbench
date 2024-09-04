import DatabasePage from "@components/pageComponents/DatabasePage";
import Page from "@components/util/Page";
import { DatabaseParams } from "@lib/params";
import { database } from "@lib/urls";
import { NextPage } from "next";

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

export default DefaultBranch;
