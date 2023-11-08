import CreateDatabase from "@components/CreateDatabase";
import MainLayout from "@components/layouts/MainLayout";
import Link from "@components/links/Link";
import { useDatabasesQuery } from "@gen/graphql-types";
import { database } from "@lib/urls";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import css from "./index.module.css";

export default function DatabasesPage() {
  const res = useDatabasesQuery();

  return (
    <MainLayout className={css.container}>
      <h1>Choose a database</h1>
      <p>
        Choose an existing database or create a new database to get started.
      </p>
      <ul>
        {res.data?.databases.map(db => (
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
      <CreateDatabase buttonClassName={css.button} />
    </MainLayout>
  );
}
