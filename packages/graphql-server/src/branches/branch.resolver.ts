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
import { DataSourceService } from "../dataSources/dataSource.service";
import { Table } from "../tables/table.model";
import { TableResolver } from "../tables/table.resolver";
import { BranchArgs, DBArgs } from "../utils/commonTypes";
import { SortBranchesBy } from "./branch.enum";
import { Branch, BranchNamesList, fromDoltBranchesRow } from "./branch.model";
import {
  branchQuery,
  callDeleteBranch,
  callNewBranch,
  getBranchesQuery,
} from "./branch.queries";

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
}

@ArgsType()
export class CreateBranchArgs extends DBArgs {
  @Field()
  newBranchName: string;

  @Field()
  fromRefName: string;
}

@ArgsType()
class ListBranchesArgs extends DBArgs {
  @Field(_type => SortBranchesBy, { nullable: true })
  sortBy?: SortBranchesBy;
}

@Resolver(_of => Branch)
export class BranchResolver {
  constructor(
    private readonly dss: DataSourceService,
    private readonly tableResolver: TableResolver,
  ) {}

  @Query(_returns => Branch, { nullable: true })
  async branch(@Args() args: BranchArgs): Promise<Branch | undefined> {
    return this.dss.query(async query => {
      const branch = await query(branchQuery, [args.branchName]);
      if (!branch.length) return undefined;
      return fromDoltBranchesRow(args.databaseName, branch[0]);
    });
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

  @Query(_returns => BranchNamesList)
  async branches(@Args() args: ListBranchesArgs): Promise<BranchNamesList> {
    return this.dss.query(async query => {
      const branches = await query(getBranchesQuery(args.sortBy));
      return {
        list: branches.map(b => fromDoltBranchesRow(args.databaseName, b)),
      };
    });
  }

  @Query(_returns => Branch, { nullable: true })
  async defaultBranch(@Args() args: DBArgs): Promise<Branch | undefined> {
    const branchNames = await this.branches(args);
    return getDefaultBranchFromBranchesList(branchNames.list);
  }

  @Mutation(_returns => Branch)
  async createBranch(@Args() args: CreateBranchArgs): Promise<Branch> {
    return this.dss.query(async query => {
      await query(callNewBranch, [args.newBranchName, args.fromRefName]);
      const branch = await query(branchQuery, [args.newBranchName]);
      if (!branch.length) throw new Error("Created branch not found");
      return fromDoltBranchesRow(args.databaseName, branch[0]);
    });
  }

  @Mutation(_returns => Boolean)
  async deleteBranch(@Args() args: BranchArgs): Promise<boolean> {
    return this.dss.query(async query => {
      await query(callDeleteBranch, [args.branchName]);
      return true;
    });
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
    @Args() { filterSystemTables }: FilterSystemTablesArgs,
  ): Promise<string[]> {
    const { list } = await this.tableResolver.tableNames({
      ...branch,
      filterSystemTables,
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
