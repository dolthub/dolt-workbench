import MainLayout from "@components/layouts/MainLayout";
import DoltLink from "@components/links/DoltLink";
import DoltgresLink from "@components/links/DoltgresLink";
import { QueryHandler } from "@dolthub/react-components";
import { useStoredConnectionsQuery } from "@gen/graphql-types";
import ExistingConnections from "./ExistingConnections";
import NewConnection from "./NewConnection";
import css from "./index.module.css";

export default function ConfigurationPage() {
  const res = useStoredConnectionsQuery();
  return (
    <MainLayout className={css.container}>
      <div className={css.inner}>
        <div className={css.top}>
          <h1>Welcome to the Dolt Workbench</h1>
          <p>
            Connect the workbench to any MySQL or PostgreSQL compatible
            database. Use <DoltLink /> or <DoltgresLink /> to unlock version
            control features.
          </p>
        </div>
        <QueryHandler
          result={res}
          render={data =>
            data.storedConnections.length ? (
              <ExistingConnections connections={data.storedConnections} />
            ) : (
              <NewConnection canGoBack={!!data.storedConnections.length} />
            )
          }
        />
      </div>
    </MainLayout>
  );
}
