import { MockedResponse } from "@apollo/client/testing";
import { TableWithColumnsFragment } from "@gen/graphql-types";
import { tableNamesMock } from "@hooks/useTableNames/mocks";
import { RefParams } from "@lib/params";

const databaseName = "test";

export const tableOne: TableWithColumnsFragment = {
  _id: `databases/${databaseName}/tables/tablename`,
  __typename: "Table",
  tableName: "tablename",
  columns: [
    {
      __typename: "Column",
      name: "pk",
      type: "INT",
      isPrimaryKey: true,
      constraints: null,
    },
    {
      __typename: "Column",
      name: "name",
      type: "VARCHAR(16383)",
      isPrimaryKey: false,
      constraints: null,
    },
  ],
};

export const tableTwo: TableWithColumnsFragment = {
  _id: `databases/${databaseName}/tables/tablenameSecond`,
  __typename: "Table",
  tableName: "tablenameSecond",
  columns: [
    {
      __typename: "Column",
      name: "pk_second",
      type: "INT",
      isPrimaryKey: true,
      constraints: null,
    },
    {
      __typename: "Column",
      name: "name_second",
      type: "VARCHAR(16383)",
      isPrimaryKey: false,
      constraints: null,
    },
  ],
};

export const mocks = (
  params: RefParams,
  tables: TableWithColumnsFragment[] = [tableOne],
): MockedResponse[] => [
  tableNamesMock(
    params,
    tables.map(t => t.tableName),
  ),
];
