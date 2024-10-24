import { BranchFragment } from "@gen/graphql-types";
import InfiniteScroll from "react-infinite-scroller";
import BranchRow from "./BranchRow";
import css from "./index.module.css";

type Props = {
  branches: BranchFragment[];
  onDeleteClicked: (b: BranchFragment) => void;
  loadMore: () => Promise<void>;
  hasMore: boolean;
};

export default function BranchList(props: Props): JSX.Element {
  return (
    <InfiniteScroll
      // Passing extra props to infinite scroll seems to apply those props to the top level div,
      // so we can't spread props here.
      loadMore={props.loadMore}
      hasMore={props.hasMore}
      loader={<div className={css.loader}>Loading branches ...</div>}
      useWindow={false}
      initialLoad={false}
      getScrollParent={() => document.getElementById("main-content")}
    >
      <table className={css.table} data-cy="branch-list">
        <thead>
          <tr>
            <th>Branch name</th>
            <th>Last updated by</th>
            <th>Last updated</th>
            <th aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          {props.branches.map(b => (
            <BranchRow
              onDeleteClicked={() => props.onDeleteClicked(b)}
              key={b._id}
              branch={b}
            />
          ))}
        </tbody>
      </table>
    </InfiniteScroll>
  );
}
