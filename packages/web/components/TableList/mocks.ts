import { MockedResponse } from "@apollo/client/testing";
import { TableWithColumnsFragment } from "@gen/graphql-types";
import { tableNamesMock } from "@hooks/useTableNames/mocks";
import { RefParams } from "@lib/params";

export const tableOne: TableWithColumnsFragment = {
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
): MockedResponse[] => [tableNamesMock(tables.map(t => t.tableName))];
