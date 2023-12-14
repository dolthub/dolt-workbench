import { DatabaseParams } from "@lib/params";
import Breadcrumbs from ".";
import { releasesBreadcrumbsDetails } from "./breadcrumbDetails";

type Props = {
  params: DatabaseParams;
  className?: string;
  new?: boolean;
};

export default function ReleasesBreadcrumbs({ params, ...props }: Props) {
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-releases-breadcrumbs"
      data-cy="db-releases-breadcrumbs"
      breadcrumbs={db => releasesBreadcrumbsDetails(params, props.new, db)}
    />
  );
}
