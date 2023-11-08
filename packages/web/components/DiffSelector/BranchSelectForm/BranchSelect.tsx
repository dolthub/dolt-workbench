import FormSelect from "@components/FormSelect";
import { BranchFragment } from "@gen/graphql-types";
import css from "./index.module.css";

type Props = {
  branchList: BranchFragment[];
  currentBranchName: string;
  onChange: (b: string) => void;
  label: string;
};

export default function BranchSelect(props: Props) {
  return (
    <FormSelect
      options={props.branchList.map(b => {
        return {
          value: b.branchName,
          label: b.branchName,
        };
      })}
      val={props.currentBranchName}
      onChangeValue={props.onChange}
      hideSelectedOptions
      className={css.selector}
      label={props.label}
      small
      horizontal
    />
  );
}
