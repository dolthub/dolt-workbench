import Page from "@components/util/Page";
import { DatabaseParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: DatabaseParams & {
    refName?: string | null;
    active?: string;
    edit?: boolean;
  };
};

const CreateTablePage: NextPage<Props> = ({ params }) => (
  <Page title="Create table" noIndex>
    <DatabasePage.ForCreateTable params={params} />
  </Page>
);

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
  params,
}) => {
  return {
    props: {
      params: {
        ...(params as DatabaseParams),
        refName: query.refName ? String(query.refName) : null,
        active: query.active ? String(query.active) : "",
        edit: !!query.edit,
      },
    },
  };
};

export default CreateTablePage;
