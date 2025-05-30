import { BranchResolver } from "./branches/branch.resolver";
import { CommitResolver } from "./commits/commit.resolver";
import { DatabaseResolver } from "./databases/database.resolver";
import { DiffStatResolver } from "./diffStats/diffStat.resolver";
import { DiffSummaryResolver } from "./diffSummaries/diffSummary.resolver";
import { DocsResolver } from "./docs/doc.resolver";
import { PullConflictsResolver } from "./pullConflicts/pullConflict.resolver";
import { PullResolver } from "./pulls/pull.resolver";
import { RemoteResolver } from "./remotes/remote.resolver";
import { RowDiffResolver } from "./rowDiffs/rowDiff.resolver";
import { RowResolver } from "./rows/row.resolver";
import { SchemaDiffResolver } from "./schemaDiffs/schemaDiff.resolver";
import { SchemaResolver } from "./schemas/schema.resolver";
import { SqlSelectResolver } from "./sqlSelects/sqlSelect.resolver";
import { StatusResolver } from "./status/status.resolver";
import { TableResolver } from "./tables/table.resolver";
import { FileUploadResolver } from "./tables/upload.resolver";
import { TagResolver } from "./tags/tag.resolver";

const resolvers = [
  BranchResolver,
  CommitResolver,
  DatabaseResolver,
  DiffStatResolver,
  DiffSummaryResolver,
  DocsResolver,
  FileUploadResolver,
  PullConflictsResolver,
  PullResolver,
  RemoteResolver,
  RowDiffResolver,
  RowResolver,
  SchemaDiffResolver,
  SchemaResolver,
  SqlSelectResolver,
  StatusResolver,
  TableResolver,
  TagResolver,
];

export default resolvers;
