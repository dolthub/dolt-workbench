import QueryHandler from "@components/util/QueryHandler";
import { useCurrentDatabaseQuery } from "@gen/graphql-types";
import css from "./index.module.css";

export default function CurrentDatabase() {
  const res = useCurrentDatabaseQuery();
  return (
    <QueryHandler
      result={res}
      render={data => (
        <div className={css.database}>
          <span>Database</span>: {data.currentDatabase}
        </div>
      )}
    />
  );
}
