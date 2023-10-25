import Page from "@components/util/Page";
import { RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Params = RefParams & {
  diffRange: string;
};

type Props = {
  params: Params;
  tableName?: string;
};

const DiffRangePage: NextPage<Props> = ({ params, tableName }) => (
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
      tableName={tableName}
    />
  </Page>
);

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  return {
    props: {
      params: params as Params,
      tableName: query.tableName ? String(query.tableName) : "",
    },
  };
};

export default DiffRangePage;
