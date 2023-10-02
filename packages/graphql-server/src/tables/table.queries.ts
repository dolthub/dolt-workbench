export const indexQuery = `SELECT table_name, index_name, comment, non_unique, GROUP_CONCAT(column_name ORDER BY seq_in_index) AS COLUMNS 
FROM information_schema.statistics 
WHERE table_name=? AND index_name!="PRIMARY" 
GROUP BY index_name;`;

export const foreignKeysQuery = `SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE table_name=? AND referenced_table_schema IS NOT NULL`;

export const columnsQuery = `DESCRIBE ??`;

export const listTablesQuery = `SHOW FULL TABLES WHERE table_type = 'BASE TABLE'`;
