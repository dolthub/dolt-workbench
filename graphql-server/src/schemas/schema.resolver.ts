import { ArgsType, Args, Field, Query, Resolver } from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import {
  SqlSelect,
  fromServerPaginatedRows,
} from "../sqlSelects/sqlSelect.model";
import { RefArgs, RefMaybeSchemaArgs } from "../utils/commonTypes";
import { SchemaType } from "./schema.enums";
import { SchemaItem } from "./schema.model";

@ArgsType()
class SchemaDefinitionArgs extends RefMaybeSchemaArgs {
  @Field()
  name: string;

  @Field(_type => SchemaType)
  kind: SchemaType;
}

@Resolver(_of => SchemaItem)
export class SchemaResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(_returns => [SchemaItem])
  async doltSchemas(
    @Args() args: RefMaybeSchemaArgs,
    type?: SchemaType,
  ): Promise<SchemaItem[]> {
    const conn = this.conn.connection();
    const res = await conn.getSchemas(args, type);
    return res;
  }

  @Query(_returns => [SchemaItem])
  async views(@Args() args: RefMaybeSchemaArgs): Promise<SchemaItem[]> {
    return this.doltSchemas(args, SchemaType.View);
  }

  @Query(_returns => [SchemaItem])
  async doltProcedures(@Args() args: RefArgs): Promise<SchemaItem[]> {
    const conn = this.conn.connection();
    const res = await conn.getProcedures(args);
    return res;
  }

  @Query(_returns => SqlSelect)
  async schemaDefinition(
    @Args() args: SchemaDefinitionArgs,
  ): Promise<SqlSelect> {
    const conn = this.conn.connection();
    const res = await conn.schemaDefinition(args);
    return fromServerPaginatedRows(
      args.databaseName,
      args.refName,
      res.rows,
      res.executionMessage,
      res.queryString ?? "",
      0,
    );
  }
}
