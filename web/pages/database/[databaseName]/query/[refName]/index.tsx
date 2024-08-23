import Page from "@components/util/Page";
import { RefOptionalSchemaParams, RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type QueryPageQueryParams = RefOptionalSchemaParams & {
  q?: string;
  active?: string;
};

type Props = {
  params: QueryPageQueryParams;
};

const QueryPage: NextPage<Props> = props => {
  const defaultQuery = "SHOW TABLES";
  const params = {
    ...props.params,
    q: props.params.q ?? defaultQuery,
  };
  return (
    <Page title={`${props.params.databaseName} - Query`} noIndex>
      <DatabasePage.ForQuery params={params} />
    </Page>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  return {
    props: {
      params: {
        ...(params as RefParams),
        q: query.q ? String(query.q) : "",
        active: query.active ? String(query.active) : "",
        schemaName: query.schemaName ? String(query.schemaName) : "",
      },
    },
  };
};

export default QueryPage;
