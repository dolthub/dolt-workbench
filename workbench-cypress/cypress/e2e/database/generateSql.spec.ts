import {
  formatDataCy,
  newClickFlow,
  newExpectationWithClickFlows,
} from "@utils/helpers";
import {
  beVisible,
  shouldFindAndContain,
} from "@sharedTests/sharedFunctionsAndVariables";
import { runTests } from "@utils/index";
import { Expectation } from "@utils/types";

const pageName = "Generate SQL";
const dbName = "us-jails";
const currentPage = `/database/${dbName}`;

const tableName = "incidents";

const generateSqlForWhereClauseTest = (
  columnName: string,
  rowId: number,
  colId: number,
  expectedSql: string,
): Expectation => {
  const cellDataCy = `desktop-db-data-table-row-${rowId}-col-${colId}`;
  const cellSelector = formatDataCy(cellDataCy);

  const cellDropdownDataCy = `desktop-db-data-table-row-${rowId}-col-${colId}-dropdown`;
  const cellDropdownSelector = formatDataCy(cellDropdownDataCy);

  return newExpectationWithClickFlows(
    "should generate SQL for 'where' clause",
    cellSelector,
    beVisible,
    [
      newClickFlow(
        cellDropdownSelector,
        [
          shouldFindAndContain(
            `${cellDropdownDataCy}-filter`,
            "Filter By Cell",
          ),
        ],
        undefined,
        true,
      ),
      newClickFlow(formatDataCy(`${cellDropdownDataCy}-filter`), [
        shouldFindAndContain("sql-editor-collapsed", expectedSql),
      ]),
    ],
  );
};
const generateSqlForOrderByClauseTest = (
  columnName: string,
  orderByType: string,
  expectedSql: string,
): Expectation => {
  const columnDataCy = `desktop-db-data-table-column-${columnName}`;
  const columnSelector = formatDataCy(columnDataCy);

  const columnDropdownDataCy = `${columnDataCy}-dropdown`;
  const columnDropdownSelector = formatDataCy(columnDropdownDataCy);

  return newExpectationWithClickFlows(
    "should generate SQL for 'order by' clause",
    columnSelector,
    beVisible,
    [
      newClickFlow(
        columnDropdownSelector,
        [
          shouldFindAndContain(
            `${columnDropdownDataCy}-sort-default`,
            "Sort default",
          ),
        ], // should always have sort-default
        undefined,
        true,
      ),
      newClickFlow(
        formatDataCy(`${columnDropdownDataCy}-sort-${orderByType}`),
        [shouldFindAndContain("sql-editor-collapsed", expectedSql)],
      ),
    ],
  );
};

describe(pageName, () => {
  const whereColumnName = "deaths";
  const whereColumnValue = "1";

  const whereColumnRowId = 0;
  const whereColumnColId = 3;

  const orderByColumnName = "start_date";
  const orderByType = "old-new";
  const orderByDirection = "ASC";

  const expectedSql = `SELECT * FROM \`${tableName}\` WHERE \`${whereColumnName}\` = '${whereColumnValue}'`;
  const expectedSqlWithOrderBy = `${expectedSql} ORDER BY \`${orderByColumnName}\` ${orderByDirection}`;

  const tests = [
    generateSqlForWhereClauseTest(
      whereColumnName,
      whereColumnRowId,
      whereColumnColId,
      expectedSql,
    ),
    generateSqlForOrderByClauseTest(
      orderByColumnName,
      orderByType,
      expectedSqlWithOrderBy,
    ),
  ];
  runTests({ tests, currentPage, pageName });
});
