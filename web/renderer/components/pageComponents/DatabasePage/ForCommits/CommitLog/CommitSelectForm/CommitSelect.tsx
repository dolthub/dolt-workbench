import { FormSelect } from "@dolthub/react-components";
import { CommitForCommitSelectorFragment } from "@gen/graphql-types";
import css from "./index.module.css";

type Props = {
  commits: CommitForCommitSelectorFragment[];
  currentCommitId: string;
  onChange: (c: string) => void;
  label: string;
};

export default function CommitSelect(props: Props) {
  return (
    <FormSelect
      options={props.commits.map(c => {
        return {
          value: c.commitId,
          label: c.commitId,
        };
      })}
      val={props.currentCommitId}
      onChangeValue={c => props.onChange(c || "")}
      hideSelectedOptions
      className={css.selector}
      label={props.label}
      horizontal
    />
  );
}
