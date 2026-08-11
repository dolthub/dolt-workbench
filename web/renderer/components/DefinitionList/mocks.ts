import { MockedResponse } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { tableNamesMock } from "@hooks/useTableNames/mocks";
import { RefParams } from "@lib/params";

export const tableOne = "tableName";
export const tableTwo = "tableNameSecond";
export const activeTableName = tableOne;

export const mocks = (
  params: RefParams,
  tables: string[],
): MockedResponse[] => [
  tableNamesMock(params, tables),
  databaseDetailsMock(true, false),
];
