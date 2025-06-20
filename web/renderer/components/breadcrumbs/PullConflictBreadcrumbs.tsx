import { PullDiffParams } from "@lib/params";
import Breadcrumbs from ".";
import { pullConflictBreadcrumbDetails } from "./breadcrumbDetails";

type Props = {
  params: PullDiffParams;
  className?: string;
};

export default function PullConflictBreadcrumbs({ params, ...props }: Props) {
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-pull-conflict-breadcrumbs"
      data-cy="db-pull-conflict-breadcrumbs"
      breadcrumbs={pullConflictBreadcrumbDetails(params)}
    />
  );
}
