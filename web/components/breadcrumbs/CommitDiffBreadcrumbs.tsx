import { RefParams } from "@lib/params";
import { useRouter } from "next/router";
import Breadcrumbs from ".";
import { commitDiffBreadcrumbDetails } from "./breadcrumbDetails";
import { getDiffRangeFromString } from "./utils";

type Props = {
  params: RefParams;
  className?: string;
};

export default function CommitDiffBreadcrumbs({ params, ...props }: Props) {
  const router = useRouter();
  const diffRange = getDiffRangeFromString(
    "choose a commit",
    router.query.diffRange,
  );
  return (
    <Breadcrumbs
      {...props}
      aria-label="db-commit-diff-breadcrumbs"
      data-cy="db-commit-diff-breadcrumbs"
      breadcrumbs={db =>
        commitDiffBreadcrumbDetails({ ...params, diffRange }, db)
      }
    />
  );
}
