import { RefParams } from "@lib/params";
import Breadcrumbs from ".";
import { commitLogBreadcrumbDetails } from "./breadcrumbDetails";

type Props = {
  params: RefParams;
  className?: string;
};

export default function CommitsBreadcrumbs({ params, ...props }: Props) {
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-commits-breadcrumbs"
      data-cy="db-commits-breadcrumbs"
      breadcrumbs={db => commitLogBreadcrumbDetails(params, db)}
    />
  );
}
