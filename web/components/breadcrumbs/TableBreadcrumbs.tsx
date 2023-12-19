import { TableParams } from "@lib/params";
import Breadcrumbs from ".";
import { tableBreadcrumbsDetails } from "./breadcrumbDetails";

type Props = {
  params: TableParams;
  className?: string;
};

export default function TableBreadcrumbs({ params, ...props }: Props) {
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-table-breadcrumbs"
      data-cy="db-table-breadcrumbs"
      breadcrumbs={db => tableBreadcrumbsDetails(params, db)}
    />
  );
}
