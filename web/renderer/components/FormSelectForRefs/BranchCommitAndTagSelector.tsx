import { FormSelect } from "@dolthub/react-components";
import { Maybe } from "@dolthub/web-utils";
import { OptionalRefParams } from "@lib/params";
import useGetBranchOptionsForSelect from "@components/FormSelectForRefs/useGetBranchOptionsForSelect";
import useGetCommitOptionsForSelect from "@components/FormSelectForRefs/useGetCommitOptionsForSelect";
import getGroupOption from "./getGroupOption";
import useGetTagOptionsForSelect from "./useGetTagOptionsForSelect";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams;
  selectedValue: Maybe<string>;
  onChangeValue: (s: Maybe<string>) => void;
};

export default function BranchCommitAndTagSelector(props: Props) {
  const {
    branchOptions,
    error: branchErr,
    loading: branchLoading,
  } = useGetBranchOptionsForSelect(props.params);
  const {
    commitOptions,
    error: commitErr,
    loading: commitLoading,
  } = useGetCommitOptionsForSelect(props.params);
  const {
    tagOptions,
    error: tagErr,
    loading: tagLoading,
  } = useGetTagOptionsForSelect(props.params);

  const handleChangeRef = async (refName: Maybe<string>) => {
    if (!refName) return;
    props.onChangeValue(refName);
  };

  const options = [
    getGroupOption(branchOptions, "Branches", undefined, branchErr),
    getGroupOption(commitOptions, "Commits", undefined, commitErr),
    getGroupOption(tagOptions, "Tags", undefined, tagErr),
  ];

  return (
    <FormSelect.Grouped
      isLoading={branchLoading || commitLoading || tagLoading}
      value={[...branchOptions, ...commitOptions].find(
        t => t.value === props.selectedValue,
      )}
      onChange={async e => handleChangeRef(e?.value)}
      options={options}
      placeholder="select a branch, commit or tag..."
      className={css.branchAndCommitSelect}
      selectedOptionFirst
      light
    />
  );
}
