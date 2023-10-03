import { BranchResolver } from "./branches/branch.resolver";
import { DatabaseResolver } from "./databases/database.resolver";
import { RowResolver } from "./rows/row.resolver";
import { SqlSelectResolver } from "./sqlSelects/sqlSelect.resolver";
import { TableResolver } from "./tables/table.resolver";

const resolvers = [
  BranchResolver,
  DatabaseResolver,
  RowResolver,
  SqlSelectResolver,
  TableResolver,
];

export default resolvers;
