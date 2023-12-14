import { RefParams } from "@lib/params";
import Breadcrumbs from ".";
import { newDocBreadcrumbsDetails } from "./breadcrumbDetails";

type Props = {
  params: RefParams;
  className?: string;
};

export default function NewDocBreadcrumbs({ params, ...props }: Props) {
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-new-doc-breadcrumbs"
      data-cy="db-new-doc-breadcrumbs"
      breadcrumbs={db => newDocBreadcrumbsDetails(params, db)}
    />
  );
}
