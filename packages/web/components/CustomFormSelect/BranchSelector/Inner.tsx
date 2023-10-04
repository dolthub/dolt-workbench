import { BranchForBranchSelectorFragment } from "@gen/graphql-types";
import excerpt from "@lib/excerpt";
import { branches } from "@lib/urls";
import Selector from "../component";
import { BranchSelectorProps } from "./types";

const excerptLength = 35;

export default function Inner<B extends BranchForBranchSelectorFragment>(
  props: BranchSelectorProps<B>,
) {
  return (
    <div data-cy={`${props.dataCyPrefix ?? ""}branch-selector`}>
      <Selector
        {...props}
        dataCySuffix="-branch"
        val={props.selectedValue}
        noneFoundMsg="No branches found"
        label="Branch"
        options={props.branches.map(b => {
          return {
            value: b.branchName,
            label: excerpt(b.branchName, excerptLength),
          };
        })}
        footerLink={{
          urlString: "View all branches",
          urlParams: branches({
            ...props.params,
            refName: props.selectedValue,
          }),
        }}
        placeholder="select a branch..."
      />
    </div>
  );
}
