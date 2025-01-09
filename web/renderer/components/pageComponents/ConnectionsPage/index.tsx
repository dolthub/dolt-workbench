import MainLayout from "@components/layouts/MainLayout";
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
