import CreateDatabase from "@components/CreateDatabase";
import MainLayout from "@components/layouts/MainLayout";
import Link from "@components/links/Link";
import { useDatabasesQuery } from "@gen/graphql-types";
import { database } from "@lib/urls";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import cx from "classnames";
import css from "./index.module.css";

export default function DatabasesPage() {
  const res = useDatabasesQuery();

  return (
    <MainLayout>
      <h1>Choose a database</h1>
      <p className={css.desc}>
        Choose an existing database or create a new database to get started.
      </p>
      {res.data?.databases.length ? (
        <ul>
          {res.data.databases.map(db => (
            <li key={db}>
              <Link {...database({ databaseName: db })}>
                <div className={css.database}>
                  <span>{db}</span>
                  <span className={css.go}>
                    Go <FaChevronRight />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={cx(css.noDbs, css.database)}>
          No databases found. Create a database to get started.
        </p>
      )}
      <CreateDatabase buttonClassName={css.button} />
    </MainLayout>
  );
}
