import { fakeCommitId } from "@components/CustomFormSelect/mocks";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { DiffParams, TableParams } from "@lib/params";

type Params = Required<DiffParams> & { tableName: string };

const tableParams: TableParams = {
  databaseName: "dbname",
  refName: "master",
  tableName: "test-table",
};

export const params: Params = {
  ...tableParams,
  fromCommitId: fakeCommitId(),
  toCommitId: fakeCommitId(),
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
