import { FormSelect } from "@dolthub/react-components";
import { Maybe } from "@dolthub/web-utils";
import { OptionalRefParams } from "@lib/params";
import { branches, commitLog } from "@lib/urls";
import getGroupOption from "./getGroupOption";
import css from "./index.module.css";
import useGetBranchOptionsForSelect from "./useGetBranchOptionsForSelect";
import useGetCommitOptionsForSelect from "./useGetCommitOptionsForSelect";

type Props = {
  params: OptionalRefParams;
  selectedValue: Maybe<string>;
  onChangeValue: (s: Maybe<string>) => void;
};

export default function BranchAndCommitSelector(props: Props) {
  const { branchOptions, error: branchErr } = useGetBranchOptionsForSelect(
    props.params,
  );
  const {
    commitOptions,
    refParams,
    error: commitErr,
  } = useGetCommitOptionsForSelect(props.params);

  const handleChangeRef = async (refName: Maybe<string>) => {
    if (!refName) return;
    props.onChangeValue(refName);
  };

  const options = [
    getGroupOption(branchOptions, "Branches", branches(refParams), branchErr),
    getGroupOption(commitOptions, "Commits", commitLog(refParams), commitErr),
  ];

  return (
    <FormSelect.Grouped
      value={[...branchOptions, ...commitOptions].find(
        t => t.value === props.selectedValue,
      )}
      label="Pick a branch or recent commit"
      onChange={async e => handleChangeRef(e?.value)}
      options={options}
      placeholder="select a branch or commit..."
      className={css.branchAndCommitSelect}
      selectedOptionFirst
    />
  );
}
