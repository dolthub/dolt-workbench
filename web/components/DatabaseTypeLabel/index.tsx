import Loader from "@components/Loader";
import { DatabaseType, useDoltDatabaseDetailsQuery } from "@gen/graphql-types";
import cx from "classnames";
import css from "./index.module.css";

type InnerProps = {
  className?: string;
};

export default function DatabaseTypeLabel({ className }: InnerProps) {
  const { data, loading } = useDoltDatabaseDetailsQuery();
  if (loading) return <Loader loaded={false} />;

  return (
    <div
      aria-label="db-type-label"
      className={cx(css.label, className)}
      data-cy="db-type"
    >
      <span>
        {getDatabaseType(
          data?.doltDatabaseDetails.type,
          data?.doltDatabaseDetails.isDolt,
        )}
      </span>
    </div>
  );
}

function getDatabaseType(t?: DatabaseType, isDolt?: boolean): string {
  switch (t) {
    case DatabaseType.Mysql:
      return isDolt ? "Dolt" : "MySQL";
    case DatabaseType.Postgres:
      return "PostgreSQL";
    default:
      return isDolt ? "Dolt" : "MySQL";
  }
}
