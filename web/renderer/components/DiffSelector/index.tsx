import DiffSelector from "./component";
import ForBranch from "./ForBranch";
import ForBranchCommitAndTag from "./ForBranchCommitAndTag";
import ForPull from "./ForPull";

export default Object.assign(DiffSelector, {
  ForBranch,
  ForPull,
  ForBranchCommitAndTag,
});
