import {
  Args,
  ArgsType,
  Field,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { RawRow } from "../queryFactory/types";
import { Table } from "../tables/table.model";
import { TableResolver } from "../tables/table.resolver";
import { ROW_LIMIT, getNextOffset } from "../utils";
import { BranchArgs, DBArgs, DBArgsWithOffset } from "../utils/commonTypes";
import { SortBranchesBy } from "./branch.enum";
import { Branch, BranchList, fromDoltBranchesRow } from "./branch.model";

@ArgsType()
export class GetBranchOrDefaultArgs extends DBArgs {
  @Field({ nullable: true })
  branchName?: string;
}

@ArgsType()
class GetBranchTableArgs {
  @Field()
  tableName: string;
}

@ArgsType()
class FilterSystemTablesArgs {
  @Field({ nullable: true })
  filterSystemTables?: boolean;

  @Field({ nullable: true })
  schemaName?: string;
}

@ArgsType()
export class CreateBranchArgs extends DBArgs {
  @Field()
  newBranchName: string;

  @Field()
  fromRefName: string;
}

@ArgsType()
class ListBranchesArgs extends DBArgsWithOffset {
  @Field(_type => SortBranchesBy, { nullable: true })
  sortBy?: SortBranchesBy;
}

@Resolver(_of => Branch)
export class BranchResolver {
  constructor(
    private readonly conn: ConnectionProvider,
    private readonly tableResolver: TableResolver,
  ) {}

  @Query(_returns => Branch, { nullable: true })
  async branch(@Args() args: BranchArgs): Promise<Branch | undefined> {
    const conn = await this.conn.connection(args.databaseName);
    const res = await conn.getBranch(args);
    if (!res) return undefined;
    return fromDoltBranchesRow(args.databaseName, res);
  }

  @Query(_returns => Branch, { nullable: true })
  async branchOrDefault(
    @Args()
    { branchName, ...args }: GetBranchOrDefaultArgs,
  ): Promise<Branch | undefined> {
    if (!branchName) {
      return this.defaultBranch(args);
    }
    const branch = await this.branch({ ...args, branchName });
    return branch;
  }

  @Query(_returns => BranchList)
  async branches(@Args() args: ListBranchesArgs): Promise<BranchList> {
    const conn = await this.conn.connection(args.databaseName);
    const res = await conn.getBranches({ ...args, offset: args.offset ?? 0 });
    return fromBranchListRes(res, args);
  }

  @Query(_returns => [Branch])
  async allBranches(@Args() args: ListBranchesArgs): Promise<Branch[]> {
    const conn = await this.conn.connection(args.databaseName);
    const res = await conn.getAllBranches(args);
    return res.map(b => fromDoltBranchesRow(args.databaseName, b));
  }

  @Query(_returns => Branch, { nullable: true })
  async defaultBranch(@Args() args: DBArgs): Promise<Branch | undefined> {
    const branchNames = await this.branches(args);
    return getDefaultBranchFromBranchesList(branchNames.list);
  }

  @Mutation(_returns => String)
  async createBranch(@Args() args: CreateBranchArgs): Promise<string> {
    const conn = await this.conn.connection(args.databaseName);
    await conn.createNewBranch({ ...args, branchName: args.newBranchName });
    return args.newBranchName;
  }

  @Mutation(_returns => Boolean)
  async deleteBranch(@Args() args: BranchArgs): Promise<boolean> {
    const conn = await this.conn.connection(args.databaseName);
    await conn.callDeleteBranch(args);
    return true;
  }

  @ResolveField(_returns => Table, { nullable: true })
  async table(
    @Parent() branch: Branch,
    @Args() { tableName }: GetBranchTableArgs,
  ): Promise<Table | undefined> {
    return this.tableResolver.maybeTable({
      ...branch,
      refName: branch.branchName,
      tableName,
    });
  }

  @ResolveField(_returns => [String])
  async tableNames(
    @Parent() branch: Branch,
    @Args() { filterSystemTables, schemaName }: FilterSystemTablesArgs,
  ): Promise<string[]> {
    const { list } = await this.tableResolver.tableNames({
      ...branch,
      filterSystemTables,
      schemaName,
      refName: branch.branchName,
    });
    return list;
  }
}

export function getDefaultBranchFromBranchesList(
  list: Branch[],
): Branch | undefined {
  if (!list.length) return undefined;
  if (list.length === 1) return list[0];

  list.sort((i, j) => {
    if (j.branchName > i.branchName) return -1;
    if (i.branchName > j.branchName) return 1;
    return 0;
  });

  const options = list.filter(
    branch => branch.branchName === "master" || branch.branchName === "main",
  );

  if (options.length === 0) {
    return list[0];
  }

  if (options.length === 1) {
    return options[0];
  }

  // choose `main` over `master`
  if (options.length === 2) {
    if (options[0].branchName === "main") return options[0];
    return options[1];
  }

  return options[0];
}

function fromBranchListRes(
  branches: RawRow[],
  args: ListBranchesArgs,
): BranchList {
  return {
    list: branches
      .slice(0, ROW_LIMIT)
      .map(b => fromDoltBranchesRow(args.databaseName, b)),
    nextOffset: getNextOffset(branches.length, args.offset ?? 0),
  };
}
