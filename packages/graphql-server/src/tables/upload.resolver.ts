import { Args, ArgsType, Field, Mutation, Resolver } from "@nestjs/graphql";
import { ReadStream } from "fs";
import { GraphQLUpload } from "graphql-upload";
import * as mysql from "mysql2/promise";
import {
  DataSourceService,
  useDBStatement,
} from "../dataSources/dataSource.service";
import { TableArgs } from "../utils/commonTypes";
import { FileType, ImportOperation, LoadDataModifier } from "./table.enum";
import { Table } from "./table.model";
import { getLoadDataQuery } from "./table.queries";

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
  constructor(private readonly dss: DataSourceService) {}

  @Mutation(_returns => Boolean)
  async loadDataFile(@Args() args: TableImportArgs): Promise<boolean> {
    const conn = await mysql.createConnection(this.dss.getMySQLConfig());

    let isDolt = false;
    try {
      const res = await conn.query("SELECT dolt_version()");
      isDolt = !!res;
    } catch (_) {
      // ignore
    }

    await conn.query(useDBStatement(args.databaseName, args.refName, isDolt));
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
