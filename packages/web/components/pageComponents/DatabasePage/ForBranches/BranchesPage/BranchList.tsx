import { BranchFragment } from "@gen/graphql-types";
import BranchRow from "./BranchRow";
import css from "./index.module.css";

type Props = {
  branches: BranchFragment[];
  onDeleteClicked: (b: BranchFragment) => void;
};

export default function BranchList(props: Props): JSX.Element {
  return (
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
  );
}
