import Page from "@components/util/Page";
import { RefOptionalSchemaParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type QueryPageQueryParams = RefOptionalSchemaParams & {
  q?: string;
  active?: string;
};

type Props = {
  params: QueryPageQueryParams;
};

const QueryPage: NextPage<Props> = (props) => {
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

export default QueryPage;
