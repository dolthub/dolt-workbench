import { BranchResolver } from "./branches/branch.resolver";
import { CommitResolver } from "./commits/commit.resolver";
import { DatabaseResolver } from "./databases/database.resolver";
import { DocsResolver } from "./docs/doc.resolver";
import { RowResolver } from "./rows/row.resolver";
import { SqlSelectResolver } from "./sqlSelects/sqlSelect.resolver";
import { TableResolver } from "./tables/table.resolver";
import { TagResolver } from "./tags/tag.resolver";

const resolvers = [
  BranchResolver,
  CommitResolver,
  DatabaseResolver,
  DocsResolver,
  RowResolver,
  SqlSelectResolver,
  TableResolver,
  TagResolver,
];

export default resolvers;
