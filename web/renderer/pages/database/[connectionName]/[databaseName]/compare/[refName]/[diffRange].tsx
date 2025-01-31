import Page from "@components/util/Page";
import { RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

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
    <DatabasePage.ForCommits params={params} tableName={params.tableName} />
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
        ...params,
        tableName: query.tableName ? String(query.tableName) : "",
      } as Params,
    },
  };
};
// #!endif

export default DiffRangePage;
