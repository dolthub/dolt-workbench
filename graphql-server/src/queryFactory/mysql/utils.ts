import { Table, TableForeignKey } from "typeorm";
import { ForeignKey } from "../../indexes/foreignKey.model";
import { TableDetails } from "../../tables/table.model";
import { RawRows } from "../types";

export function notDoltError(action: string): Error {
  return new Error(`Cannot ${action} on non-Dolt database`);
}

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

export function convertToTableDetails(t: Table): TableDetails {
  return {
    tableName: t.name,
    columns: t.columns.map(c => {
      return {
        name: c.name,
        isPrimaryKey: c.isPrimary,
        type: `${c.type}${c.length ? `(${c.length})` : ""}${
          c.unsigned ? " unsigned" : ""
        }`,
        constraints: [{ notNull: !c.isNullable }],
        sourceTable: t.name,
      };
    }),
    foreignKeys: convertForeignKeys(t.foreignKeys, t.name),
    indexes: t.indices.map(i => {
      return {
        name: i.name ?? "",
        type: getIndexType(i.columnNames, i.isUnique),
        comment: "",
        columns: i.columnNames.map(c => {
          return { name: c };
        }),
      };
    }),
  };
}

function getIndexType(cols: string[], nonUnique: boolean): string {
  if (cols.length > 1) return "Composite";
  if (!nonUnique) return "Unique";
  return "";
}

function convertForeignKeys(
  fks: TableForeignKey[],
  tableName: string,
): ForeignKey[] {
  const nameMap: Record<string, ForeignKey> = {};
  fks.forEach(fk => {
    const name = fk.name ?? `${tableName}/${fk.columnNames[0]}`;
    nameMap[name] = {
      tableName,
      columnName: fk.columnNames[0],
      referencedTableName: fk.referencedTableName,
      foreignKeyColumn: fk.referencedColumnNames.map((col, i) => {
        return {
          referencedColumnName: col,
          referrerColumnIndex: i,
        };
      }),
    };
  });
  return Object.values(nameMap);
}
