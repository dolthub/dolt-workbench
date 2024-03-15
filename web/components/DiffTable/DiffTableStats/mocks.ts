import { fakeCommitId } from "@components/FormSelectForRefs/mocks";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { RequiredRefsParams, TableParams } from "@lib/params";

type Params = RequiredRefsParams & { tableName: string; refName: string };

const tableParams: TableParams = {
  databaseName: "dbname",
  refName: "master",
  tableName: "test-table",
};

export const params: Params = {
  ...tableParams,
  fromRefName: fakeCommitId(),
  toRefName: fakeCommitId(),
};

export const tableCols: ColumnForDataTableFragment[] = [
  {
    __typename: "Column",
    name: "id",
    isPrimaryKey: true,
    type: "INT",
  },
  {
    __typename: "Column",
    name: "name",
    isPrimaryKey: false,
    type: "VARCHAR(16383)",
  },
];
