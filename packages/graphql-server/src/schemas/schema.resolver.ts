import { Args, Query, Resolver } from "@nestjs/graphql";
import { handleTableNotFound } from "src/tables/table.resolver";
import { DataSourceService } from "../dataSources/dataSource.service";
import { RefArgs } from "../utils/commonTypes";
import { SchemaItem } from "./schema.model";
import { doltProceduresQuery, getDoltSchemasQuery } from "./schema.queries";

@Resolver(_of => SchemaItem)
export class SchemaResolver {
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => [SchemaItem])
  async doltSchemas(
    @Args() args: RefArgs,
    type?: string,
  ): Promise<SchemaItem[]> {
    return this.dss.queryMaybeDolt(
      async (query, isDolt) => {
        const res = await handleTableNotFound(async () =>
          query(getDoltSchemasQuery(!!type), [type]),
        );
        if (!res) return [];
        return res.map(r => {
          return { name: r.name, type: r.type };
        });
      },
      args.databaseName,
      args.refName,
    );
  }

  @Query(_returns => [SchemaItem])
  async views(@Args() args: RefArgs): Promise<SchemaItem[]> {
    return this.doltSchemas(args, "view");
  }

  @Query(_returns => [SchemaItem])
  async doltProcedures(@Args() args: RefArgs): Promise<[SchemaItem]> {
    return this.dss.queryMaybeDolt(
      async (query, isDolt) => {
        const res = await handleTableNotFound(async () =>
          query(doltProceduresQuery),
        );
        if (!res) return [];
        return res.map(r => {
          return { name: r.name, type: "procedure" };
        });
      },
      args.databaseName,
      args.refName,
    );
  }
}
