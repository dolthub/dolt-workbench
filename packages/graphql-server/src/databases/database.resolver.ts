import { Query, Resolver } from "@nestjs/graphql";
import { DataSource } from "typeorm";

@Resolver()
export class DatabaseResolver {
  constructor(private readonly dataSource: DataSource) {}

  @Query(_returns => String, { nullable: true })
  async currentDatabase(): Promise<string | undefined> {
    const database = await this.dataSource.query(`SELECT DATABASE()`);
    return database[0]["DATABASE()"];
  }
}
