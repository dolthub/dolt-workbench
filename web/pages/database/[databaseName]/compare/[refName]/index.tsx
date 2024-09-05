import Page from "@components/util/Page";
import { RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: RefParams & {
    tableName?: string;
  };
};

const DiffForRefPage: NextPage<Props> = ({ params }) => (
  <Page
    title={`Viewing diffs for ${params.databaseName} - ${params.refName}`}
    noIndex
  >
    <DatabasePage.ForCommits params={params} compare />
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
        ...(params as RefParams),
        tableName: query.tableName ? String(query.tableName) : "",
      },
    },
  };
};
// #!endif

export default DiffForRefPage;
