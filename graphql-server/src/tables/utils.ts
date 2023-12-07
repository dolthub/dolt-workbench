import { RawRows } from "../dataSources/types";

export function mapTablesRes(tables: RawRows): string[] {
  return tables
    .map(row => {
      // Can't use row[`Tables_in_${args.databaseName}`] because the column
      // header can sometimes be `Tables_in_[dbName]/[branchName]`
      const val = Object.keys(row).map(k =>
        k.startsWith("Tables_in_") ? row[k] : undefined,
      )[0];
      return val;
    })
    .filter(t => !!t && t !== "undefined");
}
