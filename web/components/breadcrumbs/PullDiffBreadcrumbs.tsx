import { PullDiffParams } from "@lib/params";
import Breadcrumbs from ".";
import { pullDiffBreadcrumbDetails } from "./breadcrumbDetails";

type Props = {
  params: PullDiffParams;
  className?: string;
};

export default function PullDiffBreadcrumbs({ params, ...props }: Props) {
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-pull-diff-breadcrumbs"
      data-cy="db-pull-diff-breadcrumbs"
      breadcrumbs={db => pullDiffBreadcrumbDetails(params, db)}
    />
  );
}
