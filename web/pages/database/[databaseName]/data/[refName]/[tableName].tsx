import Page from "@components/util/Page";
import { TableParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { NextPage } from "next";

type Props = {
  params: TableParams & {
    active?: string;
    edit?: boolean;
  };
};

const TablePage: NextPage<Props> = (props) => (
  <Page
    title={`${props.params.databaseName} ${props.params.tableName}`}
    noIndex
  >
    <DatabasePage.ForTable {...props} edit={props.params.edit} />
  </Page>
);

export default TablePage;
