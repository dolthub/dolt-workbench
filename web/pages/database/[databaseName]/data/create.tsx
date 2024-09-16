import Page from "@components/util/Page";
import { DatabaseParams, MaybeRefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: MaybeRefParams & {
    schemaName?: string;
    active?: string;
    edit?: boolean;
  };
};

const CreateTablePage: NextPage<Props> = ({ params }) => (
  <Page title={`${params.databaseName} - Create table`} noIndex>
    <DatabasePage.ForCreateTable params={params} />
  </Page>
);

// #!if !isElectron
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
        schemaName: query.schemaName ? String(query.schemaName) : "",
      },
    },
  };
};
// #!endif

export default CreateTablePage;
