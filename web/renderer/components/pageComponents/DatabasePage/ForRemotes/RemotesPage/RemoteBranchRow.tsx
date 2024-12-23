import { BranchFragment, RemoteFragment } from "@gen/graphql-types";

type Props = {
  branch: BranchFragment;
  remote: RemoteFragment;
};

export default function RemoteBranchRow({ branch, remote }: Props) {
  return (
    <tr>
      <td>{getBranchName(branch.branchName, remote.name)}</td>
      <td></td>
      <td></td>
    </tr>
  );
}

function getBranchName(branchName: string, remoteName: string): string {
  // Escape special characters in the remote name to safely use it in the regex
  const escapedRemoteName = remoteName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Create a regex pattern dynamically incorporating the escaped remote name
  const pattern = new RegExp(`^remotes/${escapedRemoteName}/(.+)$`);

  // Search the input string with the regex pattern
  const match = branchName.match(pattern);

  // If a match is found, return the captured group which is the branch name
  return match ? match[1] : "";
}
