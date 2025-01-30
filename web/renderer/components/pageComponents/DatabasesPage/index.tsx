import CreateDatabase from "@components/CreateDatabase";
import MainLayout from "@components/layouts/MainLayout";
import Link from "@components/links/Link";
import { excerpt } from "@dolthub/web-utils";
import { ErrorMsg, Loader } from "@dolthub/react-components";
import { useDatabasesQuery } from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { database } from "@lib/urls";
import { FaDatabase } from "@react-icons/all-files/fa/FaDatabase";
import cx from "classnames";
import { useRouter } from "next/router";
import { useEffect } from "react";
import css from "./index.module.css";
import { ConnectionParams } from "@lib/params";

type Props = {
  params: ConnectionParams;
};

export default function DatabasesPage({ params }: Props) {
  const { isPostgres } = useDatabaseDetails(params.connectionName);
  const res = useDatabasesQuery({ variables: { name: params.connectionName } });
  const router = useRouter();

  useEffect(() => {
    if (!res.data) return;
    if (res.data.databases.length === 1) {
      const { href, as } = database({
        connectionName: params.connectionName,
        databaseName: res.data.databases[0],
      });
      router.push(href, as).catch(console.error);
    }
  }, [res.data?.databases]);

  return (
    <MainLayout>
      <Loader loaded={!res.loading}>
        <div className={css.container}>
          <h1>Choose a database</h1>
          <p className={css.desc}>
            Choose an existing database or create a new database to get started.
          </p>
          {res.data?.databases.length ? (
            <ul className={css.dbList}>
              {res.data.databases.map(db => (
                <li key={db}>
                  <Link
                    {...database({
                      connectionName: params.connectionName,
                      databaseName: db,
                    })}
                  >
                    <div className={css.database}>
                      <FaDatabase />
                      <span>{excerpt(db, 32)}</span>
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
          <CreateDatabase
            buttonClassName={css.button}
            isPostgres={isPostgres}
            showText
          />
          <ErrorMsg err={res.error} />
        </div>
      </Loader>
    </MainLayout>
  );
}
