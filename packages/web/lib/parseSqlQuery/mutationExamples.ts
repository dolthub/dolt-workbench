export const mutationExamples = [
  "INSERT INTO tablename (id, name) VALUES (1, 'taylor')",
  "INSERT INTO tablename VALUES (1, 'taylor')",
  "INSERT IGNORE INTO tablename (id, name) VALUES (1, 'blah')",
  "INSERT IGNORE INTO tablename VALUES (1, 'blah')",
  "UPDATE tablename SET name='Taylor' WHERE id=1",
  "DROP TABLE tablename",
  "CREATE TABLE tablename (id INT, name VARCHAR(255), PRIMARY KEY(id))",
  "CREATE TABLE tablename (id INT, name BIT(1), PRIMARY KEY(id))",
  "ALTER TABLE tablename ADD newcolumn INT",
  "ALTER TABLE newtable ADD newercolumn BIT(1)",
  "ALTER TABLE newtable DROP PRIMARY KEY",
  "ALTER TABLE newtable DROP COLUMN id",
  "ALTER TABLE emp CHANGE salary salary2 VARCHAR(45)",
  "alter table players rename column id to player_id",
  "CREATE TABLE dev_company ( company_id INT, company_name VARCHAR(255), is_buildable BOOLEAN, PRIMARY KEY(company_id) )",
  "CREATE INDEX id_index ON emp(ID);",
  "CREATE TABLE emp2 AS SELECT * FROM emp",
  "CREATE TABLE emp2 SELECT * FROM emp",
  "CREATE VIEW test AS SELECT * FROM `tablename` LIMIT 200;",
  `with oops as (
    SELECT from_name,to_ccn, to_name
    from dolt_commit_diff_hospitals where from_commit = 'qtd6vb07pq7bfgt67m863anntm6fpu7n'
    and to_commit = 'p730obnbmihnlq54uvenck13h12f7831'
    and from_name <> to_name
    )
    update hospitals h
    join oops o
        on h.ccn = o.to_ccn
        and h.name <> o.from_name
    set h.name = o.from_name`,
  "DROP VIEW view_name",
  "DROP SCHEMA database_name",
  "drop view `view_name`",
  `CREATE TRIGGER trigger1              
  BEFORE UPDATE ON t
  FOR EACH ROW
  SET NEW.t1 = CURRENT_TIMESTAMP()`,
  "drop trigger trigger1",
  "CREATE DATABASE database_name",
  "DROP DATABASE database_name",
  "CREATE TABLE table_name (column1 varchar(255), column2 varchar(255), column3 varchar(255))",
  "ALTER TABLE table_name ADD column4 varchar(255)",
  "ALTER TABLE table_name MODIFY column1 varchar(255)",
  "ALTER TABLE table_name DROP column1",
  "DROP TABLE table_name",
  "TRUNCATE TABLE table_name",
  "INSERT INTO table_name (column1, column2) VALUES ('value1', 'value2')",
  "INSERT INTO table_name (column1, column2) SELECT column1, column2 FROM table2 WHERE column1 = 'value'",
  "UPDATE table_name SET column1 = 'new_value' WHERE column2 = 'value'",
  "UPDATE table_name SET column1 = column1 + 10 WHERE column2 = 'value'",
  "DELETE FROM table_name WHERE column1 = 'value'",
  "DELETE FROM table_name WHERE column1 IN ('value1', 'value2')",
  "DELETE FROM table_name WHERE column1 LIKE '%value%'",
  "CREATE INDEX index_name ON table_name (column1)",
  "DROP INDEX index_name ON table_name",
  "CREATE UNIQUE INDEX index_name ON table_name (column1)",
  "CREATE FULLTEXT INDEX index_name ON table_name (column1)",
  "CREATE VIEW view_name AS SELECT column1, column2 FROM table_name WHERE column1 = 'value'",
  "DROP VIEW view_name",
  "CREATE PROCEDURE procedure_name (IN param1 varchar(255), OUT param2 varchar(255)) BEGIN SELECT column1, column2 INTO param2, param3 FROM table_name WHERE column1 = param1; END;",
  "DROP PROCEDURE procedure_name",
  "CREATE FUNCTION function_name (param1 varchar(255)) RETURNS varchar(255) BEGIN DECLARE var1 varchar(255); SELECT column1 INTO var1 FROM table_name WHERE column2 = param1; RETURN var1; END;",
  "DROP FUNCTION function_name",
  "CREATE TRIGGER trigger_name BEFORE INSERT ON table_name FOR EACH ROW BEGIN INSERT INTO log_table (column1, column2) VALUES (NEW.column1, NEW.column2); END;",
  "DROP TRIGGER trigger_name",
  "SET @@GLOBAL.sql_mode = 'mode1, mode2'",
  "SET @@SESSION.sql_mode = 'mode1, mode2'",
  "SET PASSWORD = 'password'",
  "GRANT SELECT, INSERT ON table_name TO user_name",
  "REVOKE SELECT, INSERT ON table_name FROM user_name",
  "CREATE USER user_name IDENTIFIED BY 'password'",
  "DROP USER user_name",
  "ALTER USER user_name IDENTIFIED BY 'new_password'",
  "SET GLOBAL slow_query_log = 1",
  "SET SESSION slow_query_log = 1",
  "FLUSH PRIVILEGES",
];
