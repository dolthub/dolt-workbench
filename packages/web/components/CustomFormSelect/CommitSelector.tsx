import QueryHandler from "@components/util/QueryHandler";
import { CommitForHistoryFragment } from "@gen/graphql-types";
import { useCommitListForBranch } from "@hooks/useCommitListForBranch";
import { RefParams } from "@lib/params";
import Selector from "./component";
import { BaseFormSelectorProps, Tab } from "./types";
import { getCommitLabel } from "./utils";

type Props = BaseFormSelectorProps & {
  params: RefParams;
  tabs: Tab[];
  onChangeValue: (e: string) => void;
};

type InnerProps = {
  commits: CommitForHistoryFragment[];
  loadMore: () => void;
  hasMore: boolean;
} & Props;

function Inner({ commits, ...props }: InnerProps) {
  return (
    <div data-cy="commit-selector" aria-label="commit-selector">
      <Selector
        {...props}
        dataCySuffix="-commit"
        onChangeValue={props.onChangeValue}
        val={props.selectedValue ?? ""}
        noneFoundMsg="No commits found"
        label="Commit"
        options={commits.map(c => {
          return {
            value: c.commitId,
            label: getCommitLabel(c),
          };
        })}
        // footerLink={{
        //   urlString: "View all commits",
        //   urlParams: commitLog(props.params),
        // }}
      />
    </div>
  );
}

export default function CommitSelector(props: Props) {
  const res = useCommitListForBranch(props.params, true);

  return (
    <QueryHandler
      result={{ ...res, data: res.commits }}
      render={commits => (
        <Inner
          {...props}
          commits={commits}
          loadMore={res.loadMore}
          hasMore={res.hasMore}
          loading={res.loading}
        />
      )}
    />
  );
}
