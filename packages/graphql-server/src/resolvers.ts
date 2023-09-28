import { SqlSelectResolver } from "./sqlSelects/sqlSelect.resolver";
import { TableResolver } from "./tables/table.resolver";

const resolvers = [SqlSelectResolver, TableResolver];

export default resolvers;
