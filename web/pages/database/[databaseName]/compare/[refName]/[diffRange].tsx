import Page from "@components/util/Page";
import { RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type Params = RefParams & {
  diffRange: string;
  tableName?: string;
};

type Props = {
  params: Params;
};

const DiffRangePage: NextPage<Props> = ({ params }) => (
  <Page
    title={`Viewing diffs for ${params.databaseName} - ${params.diffRange}`}
    noIndex
  >
    <DatabasePage.ForCommits
      params={{
        databaseName: params.databaseName,
        refName: params.refName,
        diffRange: params.diffRange,
      }}
      tableName={params.tableName}
    />
  </Page>
);

export default DiffRangePage;
