import { DatabaseParams } from "@lib/params";
import Breadcrumbs from ".";
import { pullsBreadcrumbs } from "./breadcrumbDetails";

type Props = {
  params: DatabaseParams;
  className?: string;
};

export default function PullsBreadcrumbs({ params, ...props }: Props) {
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-pulls-breadcrumbs"
      data-cy="db-pulls-breadcrumbs"
      breadcrumbs={pullsBreadcrumbs(params)}
    />
  );
}
