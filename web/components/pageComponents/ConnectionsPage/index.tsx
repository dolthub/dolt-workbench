import MainLayout from "@components/layouts/MainLayout";
import DoltLink from "@components/links/DoltLink";
import QueryHandler from "@components/util/QueryHandler";
import {
  DatabaseConnectionFragment,
  useStoredConnectionsQuery,
} from "@gen/graphql-types";
import { useEffect, useState } from "react";
import ExistingConnections from "./ExistingConnections";
import NewConnection from "./NewConnection";
import css from "./index.module.css";

type InnerProps = {
  connections: DatabaseConnectionFragment[];
};

function Inner(props: InnerProps) {
  const [showForm, setShowForm] = useState(!props.connections.length);

  useEffect(() => {
    setShowForm(!props.connections.length);
  }, [props.connections]);

  if (showForm) {
    return (
      <NewConnection
        canGoBack={!!props.connections.length}
        setShowForm={setShowForm}
      />
    );
  }
  return <ExistingConnections {...props} setShowForm={setShowForm} />;
}

export default function ConfigurationPage() {
  const res = useStoredConnectionsQuery();
  return (
    <MainLayout className={css.container}>
      <div className={css.inner}>
        <div className={css.top}>
          <h1>Welcome to the Dolt Workbench</h1>
          <p>
            Connect the workbench to any MySQL or PostgreSQL compatible
            database. Use <DoltLink>Dolt</DoltLink> to unlock version control
            features.
          </p>
        </div>
        <QueryHandler
          result={res}
          render={data => <Inner connections={data.storedConnections} />}
        />
      </div>
    </MainLayout>
  );
}
