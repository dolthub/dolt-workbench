import { RefParams } from "@lib/params";
import Breadcrumbs from ".";
import { docBreadcrumbsDetails } from "./breadcrumbDetails";

type Props = {
  params: RefParams & { docName?: string };
  className?: string;
};

export default function DocBreadcrumbs({ params, ...props }: Props) {
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-doc-breadcrumbs"
      data-cy="db-doc-breadcrumbs"
      breadcrumbs={db => docBreadcrumbsDetails(params, db)}
    />
  );
}
