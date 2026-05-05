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
export class WhereClause {
  @Field()
  column: string;

  @Field()
  value: string;
}

@ObjectType()
export class MutationResult {
  @Field(_type => Int)
  rowsAffected: number;

  @Field()
  queryString: string;
}

@ArgsType()
export class DeleteRowArgs extends TableMaybeSchemaArgs {
  @Field(_type => [WhereClause])
  where: WhereClause[];
}

@Resolver()
export class RowMutationResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Mutation(_returns => MutationResult)
  async deleteRow(@Args() args: DeleteRowArgs): Promise<MutationResult> {
    const conn = this.conn.connection();
    return conn.deleteRow(args);
  }
}
