import { DatabaseParams } from "@lib/params";
import Breadcrumbs from ".";
import { schemaBreadcrumbsDetails } from "./breadcrumbDetails";

type Props = {
  params: DatabaseParams;
  className?: string;
};

export default function SchemaDiagramBreadcrumbs({ params, ...props }: Props) {
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-schema-diagram-breadcrumbs"
      data-cy="db-schema-diagram-breadcrumbs"
      breadcrumbs={db => schemaBreadcrumbsDetails(params, db)}
    />
  );
}
