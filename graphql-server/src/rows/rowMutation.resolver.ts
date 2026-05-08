import {
  Args,
  ArgsType,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Resolver,
} from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { TableMaybeSchemaArgs } from "../utils/commonTypes";

@InputType()
export class ColumnValueInput {
  @Field()
  column: string;

  @Field({ nullable: true })
  value?: string;

  @Field({ nullable: true })
  type?: string;
}

@ObjectType()
export class MutationResult {
  @Field(_type => Int)
  rowsAffected: number;

  @Field()
  queryString: string;

  @Field()
  executionMessage: string;
}

@ArgsType()
export class DeleteRowArgs extends TableMaybeSchemaArgs {
  @Field(_type => [ColumnValueInput])
  where: ColumnValueInput[];
}

@ArgsType()
export class InsertRowArgs extends TableMaybeSchemaArgs {
  @Field(_type => [ColumnValueInput])
  values: ColumnValueInput[];
}

@ArgsType()
export class UpdateRowArgs extends TableMaybeSchemaArgs {
  @Field(_type => [ColumnValueInput])
  set: ColumnValueInput[];

  @Field(_type => [ColumnValueInput])
  where: ColumnValueInput[];
}

@ArgsType()
export class DropColumnArgs extends TableMaybeSchemaArgs {
  @Field()
  columnName: string;
}

@Resolver()
export class RowMutationResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Mutation(_returns => MutationResult)
  async deleteRow(@Args() args: DeleteRowArgs): Promise<MutationResult> {
    const conn = this.conn.connection();
    return conn.deleteRow(args);
  }

  @Mutation(_returns => MutationResult)
  async insertRow(@Args() args: InsertRowArgs): Promise<MutationResult> {
    const conn = this.conn.connection();
    return conn.insertRow(args);
  }

  @Mutation(_returns => MutationResult)
  async updateRow(@Args() args: UpdateRowArgs): Promise<MutationResult> {
    const conn = this.conn.connection();
    return conn.updateRow(args);
  }

  @Mutation(_returns => MutationResult)
  async dropColumn(@Args() args: DropColumnArgs): Promise<MutationResult> {
    const conn = this.conn.connection();
    return conn.dropColumn(args);
  }

  @Mutation(_returns => MutationResult)
  async dropTable(@Args() args: TableMaybeSchemaArgs): Promise<MutationResult> {
    const conn = this.conn.connection();
    return conn.dropTable(args);
  }
}
