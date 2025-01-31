import { sprintf } from "@dolthub/web-utils";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { TableParams } from "@lib/params";
import { Props } from "../useGetDoltDiffQuery";
import { maybeConvertToPG } from "./utils";

// dolt_diff constants for all tables
const doltDiffColumns: ColumnForDataTableFragment[] = [
  {
    name: "from_commit",
    isPrimaryKey: false,
    type: "VARCHAR(16383)",
  },
  {
    name: "from_commit_date",
    isPrimaryKey: false,
    type: "TIMESTAMP",
  },
  {
    name: "to_commit",
    isPrimaryKey: false,
    type: "VARCHAR(16383)",
  },
  {
    name: "to_commit_date",
    isPrimaryKey: false,
    type: "TIMESTAMP",
  },
];

const diffColString = (isPG = false) =>
  maybeConvertToPG(doltDiffColumns.map(c => `\`${c.name}\``).join(", "), isPG);
const diffOrderBy = (isPG = false) =>
  maybeConvertToPG("ORDER BY `to_commit_date` DESC", isPG);
const historyCols = (isPG = false) =>
  maybeConvertToPG("`commit_hash`, `committer`, `commit_date`", isPG);
const historyOrderBy = (isPG = false) =>
  maybeConvertToPG("ORDER BY `commit_date` DESC", isPG);

// Props and expected query for lunch-places
const lpTableName = "lunch-places";
const lpPK1 = "name";
const lpPK1Val = "Sidecar";
const lpCol2 = "type of food";
const lpCol3 = "rating";

const lpParams: TableParams = {
  connectionName: "connection",
  databaseName: "test",
  refName: "master",
  tableName: lpTableName,
};

const lpCols: ColumnForDataTableFragment[] = [
  {
    name: lpPK1,
    isPrimaryKey: true,
    type: "VARCHAR(16383)",
  },
  {
    name: lpCol2,
    isPrimaryKey: false,
    type: "VARCHAR(16383)",
  },
  {
    name: lpCol3,
    isPrimaryKey: false,
    type: "FLOAT",
  },
];

const lpRow: RowForDataTableFragment = {
  columnValues: [
    { displayValue: lpPK1Val },
    { displayValue: "donut" },
    { displayValue: "10" },
  ],
};

export const lpCellProps: Props = {
  cidx: 2,
  isPK: false,
  columns: lpCols,
  row: lpRow,
  params: lpParams,
};

const lpCellClicked = lpCellProps.columns[lpCellProps.cidx].name;

export const getLpCellDiffQuery = (isPG = false) =>
  sprintf(
    maybeConvertToPG(
      "SELECT `diff_type`, `from_$`, `to_$`, $ FROM `dolt_diff_$` WHERE (`to_$` = '$' OR `from_$` = '$') AND (`from_$` <> `to_$` OR (`from_$` IS NULL AND `to_$` IS NOT NULL) OR (`from_$` IS NOT NULL AND `to_$` IS NULL)) $",
      isPG,
    ),
    lpCellClicked,
    lpCellClicked,
    diffColString(isPG),
    lpTableName,
    lpPK1,
    lpPK1Val,
    lpPK1,
    lpPK1Val,
    lpCellClicked,
    lpCellClicked,
    lpCellClicked,
    lpCellClicked,
    lpCellClicked,
    lpCellClicked,
    diffOrderBy(isPG),
  );

export const getLpCellHistoryQuery = (isPG = false) =>
  sprintf(
    maybeConvertToPG(
      `SELECT \`$\`, $ FROM \`dolt_history_$\` WHERE \`$\` = '$' $`,
      isPG,
    ),
    lpCellClicked,
    historyCols(isPG),
    lpTableName,
    lpPK1,
    lpPK1Val,
    historyOrderBy(isPG),
  );

export const lpRowProps: Props = {
  cidx: 0,
  isPK: true,
  columns: lpCols,
  row: lpRow,
  params: lpParams,
};

export const getLpRowDiffQuery = (isPG = false) =>
  sprintf(
    maybeConvertToPG(
      "SELECT `diff_type`, `from_$`, `to_$`, `from_$`, `to_$`, `from_$`, `to_$`, $ FROM `dolt_diff_$` WHERE `to_$` = '$' OR `from_$` = '$' $",
      isPG,
    ),
    lpPK1,
    lpPK1,
    lpCol2,
    lpCol2,
    lpCol3,
    lpCol3,
    diffColString(isPG),
    lpTableName,
    lpPK1,
    lpPK1Val,
    lpPK1,
    lpPK1Val,
    diffOrderBy(isPG),
  );

export const getLpRowHistoryQuery = (isPG = false) =>
  sprintf(
    maybeConvertToPG(
      `SELECT \`$\`, \`$\`, \`$\`, $ FROM \`dolt_history_$\` WHERE \`$\` = '$' $`,
      isPG,
    ),
    lpPK1,
    lpCol2,
    lpCol3,
    historyCols(isPG),
    lpTableName,
    lpPK1,
    lpPK1Val,
    historyOrderBy(isPG),
  );

// Props and expected query for corona-virus-state-action
const saTableName = "state_actions";
const saPK1 = "state_id";
const saPK1Val = "CA";
const saPK2 = "reporting_date";
const saPK2Val = "Fri, 03 Apr 2020 00:00:00 GMT";
const saPK2ValAdjusted = "2020-04-03 00:00:00";
const saPK3 = "state_action";
const saPK3Val = "gatherings_limits_and_stay_at_home";
const saCol4 = "details";
const saFromCommit = "h553kbfd9li96712gv1ru2agu0a4delg";
const saToCommit = "7e6apqcfnvs9lf9h9j6e32kc6svg27iv";

const saParams: TableParams = {
  connectionName: "connection",
  databaseName: "test",
  refName: "master",
  tableName: saTableName,
};

const saCols: ColumnForDataTableFragment[] = [
  {
    name: saPK1,
    isPrimaryKey: true,
    type: "VARCHAR(16383)",
  },
  {
    name: saPK2,
    isPrimaryKey: true,
    type: "TIMESTAMP",
  },
  {
    name: saPK3,
    isPrimaryKey: true,
    type: "VARCHAR(16383)",
  },
  {
    name: saCol4,
    isPrimaryKey: false,
    type: "VARCHAR(16383)",
  },
];

const saRow: RowForDataTableFragment = {
  columnValues: [
    { displayValue: saPK1Val },
    { displayValue: saPK2Val },
    { displayValue: saPK3Val },
    { displayValue: "Yes - stay at home order" },
  ],
};

export const saCellProps: Props = {
  cidx: 3,
  isPK: false,
  columns: saCols,
  row: saRow,
  params: saParams,
};

const saClickedCell = saCellProps.columns[saCellProps.cidx].name;

export const getSaCellDiffQuery = (isPG = false) =>
  sprintf(
    maybeConvertToPG(
      "SELECT `diff_type`, `from_$`, `to_$`, $ FROM `dolt_diff_$` WHERE ((`to_$` = '$' AND `to_$` = '$' AND `to_$` = '$') OR (`from_$` = '$' AND `from_$` = '$' AND `from_$` = '$')) AND (`from_$` <> `to_$` OR (`from_$` IS NULL AND `to_$` IS NOT NULL) OR (`from_$` IS NOT NULL AND `to_$` IS NULL)) $",
      isPG,
    ),
    saClickedCell,
    saClickedCell,
    diffColString(isPG),
    saTableName,
    saPK1,
    saPK1Val,
    saPK2,
    saPK2ValAdjusted,
    saPK3,
    saPK3Val,
    saPK1,
    saPK1Val,
    saPK2,
    saPK2ValAdjusted,
    saPK3,
    saPK3Val,
    saClickedCell,
    saClickedCell,
    saClickedCell,
    saClickedCell,
    saClickedCell,
    saClickedCell,
    diffOrderBy(isPG),
  );

export const getSaCellHistoryQuery = (isPG = false) =>
  sprintf(
    maybeConvertToPG(
      "SELECT `$`, $ FROM `dolt_history_$` WHERE `$` = '$' AND `$` = '$' AND `$` = '$' $",
      isPG,
    ),
    saClickedCell,
    historyCols(isPG),
    saTableName,
    saPK1,
    saPK1Val,
    saPK2,
    saPK2ValAdjusted,
    saPK3,
    saPK3Val,
    historyOrderBy(isPG),
  );

export const saRowProps: Props = {
  cidx: 1,
  isPK: true,
  columns: saCols,
  row: saRow,
  params: saParams,
};

export const getSaRowDiffQuery = (isPG = false) =>
  sprintf(
    maybeConvertToPG(
      "SELECT `diff_type`, `from_$`, `to_$`, `from_$`, `to_$`, `from_$`, `to_$`, `from_$`, `to_$`, $ FROM `dolt_diff_$` WHERE (`to_$` = '$' AND `to_$` = '$' AND `to_$` = '$') OR (`from_$` = '$' AND `from_$` = '$' AND `from_$` = '$') $",
      isPG,
    ),
    saPK1,
    saPK1,
    saPK2,
    saPK2,
    saPK3,
    saPK3,
    saCol4,
    saCol4,
    diffColString(isPG),
    saTableName,
    saPK1,
    saPK1Val,
    saPK2,
    saPK2ValAdjusted,
    saPK3,
    saPK3Val,
    saPK1,
    saPK1Val,
    saPK2,
    saPK2ValAdjusted,
    saPK3,
    saPK3Val,
    diffOrderBy(isPG),
  );

export const getSaRowHistoryQuery = (isPG = false) =>
  sprintf(
    maybeConvertToPG(
      "SELECT `$`, `$`, `$`, `$`, $ FROM `dolt_history_$` WHERE `$` = '$' AND `$` = '$' AND `$` = '$' $",
      isPG,
    ),
    saPK1,
    saPK2,
    saPK3,
    saCol4,
    historyCols(isPG),
    saTableName,
    saPK1,
    saPK1Val,
    saPK2,
    saPK2ValAdjusted,
    saPK3,
    saPK3Val,
    historyOrderBy(isPG),
  );

export const getSaDiffForCommitsQuery = (isPG = false) =>
  sprintf(
    maybeConvertToPG(
      'SELECT diff_type, `from_$`, `to_$`, `from_$`, `to_$`, `from_$`, `to_$`, `from_$`, `to_$`, $\nFROM `dolt_diff_$`\nWHERE from_commit="$" AND to_commit="$"',
      isPG,
    ),
    saPK1,
    saPK1,
    saPK2,
    saPK2,
    saPK3,
    saPK3,
    saCol4,
    saCol4,
    diffColString(isPG),
    saTableName,
    saFromCommit,
    saToCommit,
  );

export const getSaCommitDiffForCommitsQuery = (isPG = false) =>
  sprintf(
    maybeConvertToPG(
      'SELECT diff_type, `from_$`, `to_$`, `from_$`, `to_$`, `from_$`, `to_$`, `from_$`, `to_$`, $\nFROM `dolt_commit_diff_$`\nWHERE from_commit="$" AND to_commit="$"',
      isPG,
    ),
    saPK1,
    saPK1,
    saPK2,
    saPK2,
    saPK3,
    saPK3,
    saCol4,
    saCol4,
    diffColString(isPG),
    saTableName,
    saFromCommit,
    saToCommit,
  );

const getSaBaseDiffHistoryQuery = (isPG = false) =>
  sprintf(
    maybeConvertToPG(
      "SELECT `$`, `$`, `$`, `$`, $ FROM `dolt_history_$`",
      isPG,
    ),
    saPK1,
    saPK2,
    saPK3,
    saCol4,
    historyCols(isPG),
    saTableName,
  );

export const getSaDiffHistoryQuery = (isPG = false) =>
  sprintf("$ $", getSaBaseDiffHistoryQuery(isPG), historyOrderBy(isPG));

export const getSaDiffForCommitsWithClausesQuery = (isPG = false) =>
  sprintf(
    "$ AND `diff_type` = 'added' AND `to_$` = '$'\n$",
    getSaDiffForCommitsQuery(isPG),
    saPK1,
    saPK1Val,
    diffOrderBy(isPG),
  );

export const getSaDiffHistoryWithClausesQuery = (isPG = false) =>
  sprintf(
    maybeConvertToPG("$ WHERE `$` = '$' $", isPG),
    getSaBaseDiffHistoryQuery(isPG),
    saPK1,
    saPK1Val,
    historyOrderBy(isPG),
  );
