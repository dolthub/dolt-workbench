import { Args, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService, ParQuery } from "../dataSources/dataSource.service";
import { handleTableNotFound } from "../tables/table.resolver";
import { RefArgs } from "../utils/commonTypes";
import { SchemaType } from "./schema.enums";
import { SchemaItem } from "./schema.model";
import {
  doltProceduresQuery,
  getDoltSchemasQuery,
  getEventsQuery,
  getProceduresQuery,
  getTriggersQuery,
  getViewsQuery,
} from "./schema.queries";

@Resolver(_of => SchemaItem)
export class SchemaResolver {
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => [SchemaItem])
  async doltSchemas(
    @Args() args: RefArgs,
    type?: SchemaType,
  ): Promise<SchemaItem[]> {
    return this.dss.queryMaybeDolt(
      async (query, isDolt) => {
        if (!isDolt) {
          return getSchemasForNonDolt(query, args.databaseName, type);
        }

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
    return this.doltSchemas(args, SchemaType.View);
  }

  @Query(_returns => [SchemaItem])
  async doltProcedures(@Args() args: RefArgs): Promise<[SchemaItem]> {
    return this.dss.queryMaybeDolt(
      async (query, isDolt) => {
        if (!isDolt) {
          const res = await query(getProceduresQuery, [args.databaseName]);
          return res.map(r => {
            return { name: r.Name, type: SchemaType.Procedure };
          });
        }

        const res = await handleTableNotFound(async () =>
          query(doltProceduresQuery),
        );
        if (!res) return [];
        return res.map(r => {
          return { name: r.name, type: SchemaType.Procedure };
        });
      },
      args.databaseName,
      args.refName,
    );
  }
}

async function getSchemasForNonDolt(
  query: ParQuery,
  dbName: string,
  type?: string,
): Promise<SchemaItem[]> {
  const vRes = await query(getViewsQuery, [dbName]);
  const views = vRes.map(v => {
    return { name: v.TABLE_NAME, type: SchemaType.View };
  });
  if (type === SchemaType.View) {
    return views;
  }

  const tRes = await query(getTriggersQuery);
  const triggers = tRes.map(t => {
    return { name: t.Trigger, type: SchemaType.Trigger };
  });

  const eRes = await query(getEventsQuery);
  const events = eRes.map(e => {
    return { name: e.Name, type: SchemaType.Event };
  });

  return [...views, ...triggers, ...events];
}
