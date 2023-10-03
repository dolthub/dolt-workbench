import QueryHandler from "@components/util/QueryHandler";
import { useCurrentDatabaseQuery } from "@gen/graphql-types";
import Breadcrumbs from ".";
import { databaseBreadcrumbs } from "./breadcrumbDetails";

type Props = {
  className?: string;
};

function Inner(props: Props & { databaseName: string }) {
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-breadcrumbs"
      data-cy="db-breadcrumbs"
      breadcrumbs={databaseBreadcrumbs(props.databaseName)}
    />
  );
}

export default function DatabaseBreadcrumbs(props: Props) {
  const res = useCurrentDatabaseQuery();
  return (
    <QueryHandler
      result={res}
      render={data => (
        <Inner
          {...props}
          databaseName={data.currentDatabase ?? "Database Not Found"}
        />
      )}
    />
  );
}
