import Page from "@components/util/Page";
import { RefOptionalSchemaParams, RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: RefOptionalSchemaParams & { active?: string };
};

const SchemaPage: NextPage<Props> = ({ params }) => (
  <Page title={`${params.databaseName} - Schema`} noIndex>
    <DatabasePage.ForSchema params={params} />
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
        ...(params as RefParams),
        active: query.active ? String(query.active) : "",
        schemaName: query.schemaName ? String(query.schemaName) : "",
      },
    },
  };
};
// #!endif

export default SchemaPage;
