import { FileType, LoadDataModifier } from "./table.enum";

export const indexQuery = `SELECT 
  table_name, 
  index_name, 
  GROUP_CONCAT(comment) as COMMENTS, 
  GROUP_CONCAT(non_unique) AS NON_UNIQUES, 
  GROUP_CONCAT(column_name ORDER BY seq_in_index) AS COLUMNS 
FROM information_schema.statistics 
WHERE table_name=? AND index_name!="PRIMARY" 
GROUP BY index_name;`;

export const foreignKeysQuery = `SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE table_name=? AND referenced_table_schema IS NOT NULL`;

export const columnsQuery = `DESCRIBE ??`;

export const listTablesQuery = `SHOW FULL TABLES WHERE table_type = 'BASE TABLE'`;

export const getLoadDataQuery = (
  filename: string,
  tableName: string,
  fileType: FileType,
  modifier?: LoadDataModifier,
): string => `LOAD DATA LOCAL INFILE '${filename}'
${getModifier(modifier)}INTO TABLE \`${tableName}\` 
FIELDS TERMINATED BY '${getDelim(fileType)}' ENCLOSED BY '' 
LINES TERMINATED BY '\n' 
IGNORE 1 ROWS;`;

function getModifier(m?: LoadDataModifier): string {
  switch (m) {
    case LoadDataModifier.Ignore:
      return "IGNORE ";
    case LoadDataModifier.Replace:
      return "REPLACE ";
    default:
      return "";
  }
}

function getDelim(ft: FileType): string {
  if (ft === FileType.Psv) {
    return "|";
  }
  return ",";
}
