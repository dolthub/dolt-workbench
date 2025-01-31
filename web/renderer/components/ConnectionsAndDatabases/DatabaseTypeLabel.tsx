import { DatabaseConnectionFragment, DatabaseType } from "@gen/graphql-types";
import css from "./index.module.css";

type Props = {
  conn: DatabaseConnectionFragment;
};

export function DatabaseTypeLabel({ conn }: Props) {
  const type = getDatabaseType(conn.type ?? undefined, !!conn.isDolt);
  switch (type) {
    case "Dolt":
      return (
        <span className={css.label}>
          <img src="/images/dolt-logo.png" alt="Dolt" />
        </span>
      );
    case "MySQL":
      return (
        <span className={css.label}>
          <img src="/images/mysql-logo.png" alt="MySQL" />
        </span>
      );
    case "PostgreSQL":
      return (
        <span className={css.label}>
          <img src="/images/postgres-logo.png" alt="PostgreSQL" />
        </span>
      );
    case "DoltgreSQL":
      return (
        <span className={css.label}>
          <img src="/images/doltgres-logo.png" alt="DoltgreSQL" />
        </span>
      );
    default:
      return <span className={css.label}>{type}</span>;
  }
}

export function getDatabaseType(t?: DatabaseType, isDolt?: boolean): string {
  switch (t) {
    case DatabaseType.Mysql:
      return isDolt ? "Dolt" : "MySQL";
    case DatabaseType.Postgres:
      return isDolt ? "DoltgreSQL" : "PostgreSQL";
    default:
      return isDolt ? "Dolt" : "MySQL";
  }
}
