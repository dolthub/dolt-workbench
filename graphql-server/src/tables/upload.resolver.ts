import { Args, ArgsType, Field, Mutation, Resolver } from "@nestjs/graphql";
import { ReadStream } from "fs";
// eslint-disable-next-line import/extensions, @typescript-eslint/naming-convention
import GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import { from as copyFrom } from "pg-copy-streams";
import { getSchema } from "src/queryFactory/postgres/util";
import { pipeline } from "stream/promises";
import { ConnectionProvider } from "../connections/connection.provider";
import { DatabaseType } from "../databases/database.enum";
import { useDB } from "../queryFactory/mysql/queries";
import { setSearchPath } from "../queryFactory/postgres/queries";
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
  @Field(_type => ImportOperation)
  importOp: ImportOperation;

  @Field(_type => FileType)
  fileType: FileType;

  @Field(() => GraphQLUpload)
  file: Promise<FileUpload>;

  @Field(_type => LoadDataModifier, { nullable: true })
  modifier?: LoadDataModifier;
}

@Resolver(_of => Table)
export class FileUploadResolver {
  constructor(private readonly connResolver: ConnectionProvider) {}

  @Mutation(_returns => Boolean)
  async loadDataFile(@Args() args: TableImportArgs): Promise<boolean> {
    const config = this.connResolver.getWorkbenchConfig();
    if (!config) throw new Error("Workbench config not found");

    const { createReadStream, filename } = await args.file;

    if (config.type === DatabaseType.Mysql) {
      const conn = await this.connResolver.mysqlConnection();

      let isDolt = false;
      try {
        const res = await conn.query("SELECT dolt_version()");
        isDolt = !!res;
      } catch (_) {
        // ignore
      }

      await conn.query(useDB(args.databaseName, args.refName, isDolt));
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

    const conn = await this.connResolver.connection(args.databaseName);
    const qr = conn.getQR();
    const pgConnection = await qr.connect();

    const schema = await getSchema(qr, args);
    await pgConnection.query(setSearchPath(schema));

    try {
      await pipeline(
        createReadStream,
        pgConnection.query(
          copyFrom(getCopyFromQuery(args.tableName, args.fileType)),
        ),
      );
    } finally {
      await qr.release();
    }

    return true;
  }
}

function getCopyFromQuery(tableName: string, fileType: FileType): string {
  return `COPY "${tableName}" 
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
