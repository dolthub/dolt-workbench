import { Args, Query, Resolver } from "@nestjs/graphql";
import { ConnectionResolver } from "../connections/connection.resolver";
import { RefArgs } from "../utils/commonTypes";
import { SchemaType } from "./schema.enums";
import { SchemaItem } from "./schema.model";

@Resolver(_of => SchemaItem)
export class SchemaResolver {
  constructor(private readonly conn: ConnectionResolver) {}

  @Query(_returns => [SchemaItem])
  async doltSchemas(
    @Args() args: RefArgs,
    type?: SchemaType,
  ): Promise<SchemaItem[]> {
    const conn = this.conn.connection();
    const res = await conn.getSchemas(args, type);
    return res.map(r => {
      return { name: r.name, type: r.type };
    });
  }

  @Query(_returns => [SchemaItem])
  async views(@Args() args: RefArgs): Promise<SchemaItem[]> {
    return this.doltSchemas(args, SchemaType.View);
  }

  @Query(_returns => [SchemaItem])
  async doltProcedures(@Args() args: RefArgs): Promise<SchemaItem[]> {
    const conn = this.conn.connection();
    const res = await conn.getProcedures(args);
    return res.map(r => {
      return {
        name: conn.isDolt ? r.name : r.Name,
        type: SchemaType.Procedure,
      };
    });
  }
}
