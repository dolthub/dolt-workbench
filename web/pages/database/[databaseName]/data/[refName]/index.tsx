import Page from "@components/util/Page";
import { RefOptionalSchemaParams, RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: RefOptionalSchemaParams & {
    active?: string;
  };
};

const RefPage: NextPage<Props> = ({ params }) => (
  <Page title={`${params.databaseName} - ${params.refName}`} noIndex>
    <DatabasePage.ForRef params={params} />
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
        schemaName: query.schemaName ? String(query.schemaName) : "",
        active: query.active ? String(query.active) : "",
      },
    },
  };
};
// #!endif

export default RefPage;
