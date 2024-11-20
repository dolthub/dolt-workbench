import { DatabaseParams } from "@lib/params";
import Breadcrumbs from ".";
import { databaseBreadcrumbs } from "./breadcrumbDetails";

type Props = {
  className?: string;
  params: DatabaseParams;
};

export default function DatabaseBreadcrumbs(props: Props) {
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-breadcrumbs"
      data-cy="db-breadcrumbs"
      breadcrumbs={databaseBreadcrumbs(props.params)}
    />
  );
}
