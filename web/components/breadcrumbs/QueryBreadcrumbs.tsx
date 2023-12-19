import { SqlQueryParams } from "@lib/params";
import Breadcrumbs from ".";
import { queryBreadcrumbDetails } from "./breadcrumbDetails";

type Props = {
  params: SqlQueryParams;
  className?: string;
};

export default function QueryBreadcrumbs({ params, ...props }: Props) {
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-query-breadcrumbs"
      data-cy="db-query-breadcrumbs"
      breadcrumbs={db => queryBreadcrumbDetails(params, db)}
    />
  );
}
