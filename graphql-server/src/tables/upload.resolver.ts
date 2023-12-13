import { Args, ArgsType, Field, Mutation, Resolver } from "@nestjs/graphql";
import { ReadStream } from "fs";
import { GraphQLUpload } from "graphql-upload";
import { ConnectionResolver } from "../connections/connection.resolver";
import { useDB } from "../queryFactory/mysql/queries";
import { TableArgs } from "../utils/commonTypes";
import { FileType, ImportOperation, LoadDataModifier } from "./table.enum";
import { Table } from "./table.model";

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => ReadStream;
}

@ArgsType()
class TableImportArgs extends TableArgs {
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
  constructor(private readonly connResolver: ConnectionResolver) {}

  @Mutation(_returns => Boolean)
  async loadDataFile(@Args() args: TableImportArgs): Promise<boolean> {
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

    const { createReadStream, filename } = await args.file;

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
  return ",";
}
