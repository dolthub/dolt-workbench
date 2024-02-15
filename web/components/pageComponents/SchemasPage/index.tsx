import CreateSchema from "@components/CreateSchema";
import ErrorMsg from "@components/ErrorMsg";
import MainLayout from "@components/layouts/MainLayout";
import Link from "@components/links/Link";
import { Loader } from "@dolthub/react-components";
import { useDatabaseSchemasQuery } from "@gen/graphql-types";
import { database } from "@lib/urls";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import cx from "classnames";
import { useRouter } from "next/router";
import { useEffect } from "react";
import css from "./index.module.css";

export default function SchemasPage() {
  const res = useDatabaseSchemasQuery();
  const router = useRouter();

  useEffect(() => {
    if (!res.data) return;
    if (res.data.schemas.length === 1) {
      const { href, as } = database({ databaseName: res.data.schemas[0] });
      router.push(href, as).catch(console.error);
    }
  }, [res.data?.schemas]);

  return (
    <MainLayout>
      <Loader loaded={!res.loading}>
        <h1>Choose a schema</h1>
        <p className={css.desc}>
          Choose an existing schema or create a new schema to get started.
        </p>
        {res.data?.schemas.length ? (
          <ul>
            {res.data.schemas.map(sch => (
              <li key={sch}>
                <Link {...database({ databaseName: sch })}>
                  <div className={css.database}>
                    <span>{sch}</span>
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
            No schemas found. Create a schema to get started.
          </p>
        )}
        <CreateSchema buttonClassName={css.button} />
        <ErrorMsg err={res.error} />
      </Loader>
    </MainLayout>
  );
}
