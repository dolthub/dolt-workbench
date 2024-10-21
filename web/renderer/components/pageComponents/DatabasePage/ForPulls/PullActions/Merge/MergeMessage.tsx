import css from "./index.module.css";

type Props = {
  hasConflicts: boolean;
};

export default function MergeMessage(props: Props) {
  if (props.hasConflicts) {
    return (
      <span className={css.note}>
        This branch has conflicts with the base branch.
      </span>
    );
  }

  return (
    <p className={css.note}>
      Please note: there may be conflicts. You must attempt a merge to see
      conflicts.
    </p>
  );
}
