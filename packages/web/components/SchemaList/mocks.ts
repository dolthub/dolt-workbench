import { MockedResponse } from "@apollo/client/testing";
import { tableNamesMock } from "@hooks/useTableNames/mocks";
import { RefParams } from "@lib/params";

export const tableOne = "tableName";

export const tableTwo = "tableNameSecond";

export const activeTableName = tableOne;

export const getQ = (tables: string[]) => {
  if (tables.length !== 0 && tables[0] === activeTableName) {
    return `show create table \`${activeTableName}\``;
  }
  return "";
};

export const mocks = (
  params: RefParams,
  tables: string[],
): MockedResponse[] => [tableNamesMock(params, tables)];
