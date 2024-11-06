import { DatabaseParams } from "@lib/params";
import Breadcrumbs from ".";
import { databaseBreadcrumbs } from "./breadcrumbDetails";

type Props = {
  className?: string;
  params: DatabaseParams;
  blueIcon?: boolean;
};

export default function DatabaseBreadcrumbs(props: Props) {
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-breadcrumbs"
      data-cy="db-breadcrumbs"
      breadcrumbs={databaseBreadcrumbs(props.params, props.blueIcon)}
    />
  );
}
