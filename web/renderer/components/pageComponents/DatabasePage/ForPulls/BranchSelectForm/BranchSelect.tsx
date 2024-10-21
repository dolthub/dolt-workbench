import { FormSelect } from "@dolthub/react-components";
import { Maybe } from "@dolthub/web-utils";
import { BranchForBranchSelectorFragment } from "@gen/graphql-types";
import css from "./index.module.css";

type Props = {
  branchList: BranchForBranchSelectorFragment[];
  currentBranchName: string;
  onChange: (b: Maybe<string>) => void;
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
      horizontal
    />
  );
}
