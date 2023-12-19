import { RefParams } from "@lib/params";
import Breadcrumbs from ".";
import { commitGraphBreadcrumbDetails } from "./breadcrumbDetails";

type Props = {
  params: RefParams;
  className?: string;
};

export default function CommitGraphBreadcrumbs({ params, ...props }: Props) {
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-commits-graph-breadcrumbs"
      data-cy="db-commits-graph-breadcrumbs"
      breadcrumbs={db => commitGraphBreadcrumbDetails(params, db)}
    />
  );
}
