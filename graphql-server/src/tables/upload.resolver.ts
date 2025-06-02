import { Args, ArgsType, Field, Mutation, Resolver } from "@nestjs/graphql";
import { ReadStream } from "fs";
// eslint-disable-next-line @typescript-eslint/naming-convention
import GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import { from as copyFrom } from "pg-copy-streams";
import { pipeline } from "stream/promises";
import { ConnectionProvider } from "../connections/connection.provider";
import { DatabaseType } from "../databases/database.enum";
import { useDB as doltgresUseDB } from "../queryFactory/doltgres/queries";
import { useDB as mysqlUseDB } from "../queryFactory/mysql/queries";
import { getSchema } from "../queryFactory/postgres/utils";
import { TableMaybeSchemaArgs } from "../utils/commonTypes";
import { FileType, ImportOperation, LoadDataModifier } from "./table.enum";
import { Table } from "./table.model";

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => ReadStream;
}

@ArgsType()
class TableImportArgs extends TableMaybeSchemaArgs {
  @Field(() => ImportOperation)
  importOp: ImportOperation;

  @Field(() => FileType)
  fileType: FileType;

  @Field(() => GraphQLUpload)
  file: Promise<FileUpload>;

  @Field(() => LoadDataModifier, { nullable: true })
  modifier?: LoadDataModifier;
}

@Resolver(() => Table)
export class FileUploadResolver {
  constructor(private readonly connResolver: ConnectionProvider) {}

  @Mutation(() => Boolean)
  async loadDataFile(@Args() args: TableImportArgs): Promise<boolean> {
    const config = this.connResolver.getWorkbenchConfig();
    if (!config) throw new Error("Workbench config not found");

    const { createReadStream, filename } = await args.file;

    if (config.type === DatabaseType.Mysql) {
      const conn = await this.connResolver.mysqlConnection();

      const isDolt = await getIsDolt(conn);

      await conn.query(mysqlUseDB(args.databaseName, args.refName, isDolt));
      await conn.query("SET GLOBAL local_infile=ON;");

      await conn.query({
        sql: getLoadDataQuery(
          filename,
          args.tableName,
          args.fileType,
          args.modifier,
        ),
        infileStreamFactory: createReadStream,
      });

      conn.destroy();

      return true;
    }

    const conn = this.connResolver.connection();
    const qr = conn.getQR();
    const pgConnection = await qr.connect();

    const isDolt = await getIsDolt(pgConnection);
    if (isDolt) {
      await pgConnection.query(
        doltgresUseDB(args.databaseName, args.refName, true),
      );
    }
    const schema = await getSchema(qr, args);
    const q = getCopyFromQuery(schema, args.tableName, args.fileType);

    try {
      await pipeline(createReadStream, pgConnection.query(copyFrom(q)));
    } finally {
      await qr.release();
    }

    return true;
  }
}

async function getIsDolt(conn: any): Promise<boolean> {
  try {
    const res = await conn.query("SELECT dolt_version()");
    return !!res;
  } catch {
    // ignore
  }
  return false;
}

function getCopyFromQuery(
  schemaName: string,
  tableName: string,
  fileType: FileType,
): string {
  return `COPY "${schemaName}"."${tableName}" 
FROM STDIN
WITH (
  FORMAT csv, 
  HEADER TRUE, 
  DELIMITER '${getDelim(fileType)}'
  )`;
}

function getLoadDataQuery(
  filename: string,
  tableName: string,
  fileType: FileType,
  modifier?: LoadDataModifier,
): string {
  return `LOAD DATA LOCAL INFILE '${filename}'
${getModifier(modifier)}INTO TABLE \`${tableName}\` 
FIELDS TERMINATED BY '${getDelim(fileType)}' ENCLOSED BY '' 
LINES TERMINATED BY '\n' 
IGNORE 1 ROWS;`;
}

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
  if (ft === FileType.Tsv) {
    return "\t";
  }
  return ",";
}
