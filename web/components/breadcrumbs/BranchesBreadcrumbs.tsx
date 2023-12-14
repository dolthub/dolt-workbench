import { DatabaseParams } from "@lib/params";
import Breadcrumbs from ".";
import { branchesBreadcrumbsDetails } from "./breadcrumbDetails";

type Props = {
  params: DatabaseParams;
  className?: string;
  new?: boolean;
};

export default function BranchesBreadcrumbs({ params, ...props }: Props) {
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-branches-breadcrumbs"
      data-cy="db-branches-breadcrumbs"
      breadcrumbs={db => branchesBreadcrumbsDetails(params, props.new, db)}
    />
  );
}
