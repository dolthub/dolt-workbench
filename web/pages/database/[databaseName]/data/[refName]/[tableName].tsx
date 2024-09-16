import Page from "@components/util/Page";
import { TableParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: TableParams & {
    active?: string;
    edit?: boolean;
  };
};

const TablePage: NextPage<Props> = props => (
  <Page
    title={`${props.params.databaseName} ${props.params.tableName}`}
    noIndex
  >
    <DatabasePage.ForTable {...props} edit={props.params.edit}/>
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
        ...(params as TableParams),
        active: query.active ? String(query.active) : "",
        edit: !!query.edit,
      },
    },
  };
};
// #!endif

export default TablePage;
