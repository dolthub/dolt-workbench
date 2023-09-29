import { RowResolver } from "./rows/row.resolver";
import { SqlSelectResolver } from "./sqlSelects/sqlSelect.resolver";
import { TableResolver } from "./tables/table.resolver";

const resolvers = [RowResolver, SqlSelectResolver, TableResolver];

export default resolvers;
