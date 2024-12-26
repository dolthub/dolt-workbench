import { fakeEscapePress } from "@dolthub/web-utils";
import { GoArrowDown } from "@react-icons/all-files/go/GoArrowDown";
import { DropdownItem } from "@components/DatabaseOptionsDropdown";
import useMutation from "@hooks/useMutation";
import { RemoteFragment, useFetchRemoteMutation } from "@gen/graphql-types";
import { OptionalRefParams } from "@lib/params";
import useDefaultBranch from "@hooks/useDefaultBranch";
import { ErrorMsg } from "@dolthub/react-components";

type Props = {
  setFetchModalOpen: (f: boolean) => void;
  params: OptionalRefParams;
  remote: RemoteFragment;
};
export default function FetchButton({
  setFetchModalOpen,
  params,
  remote,
}: Props) {
  const { defaultBranchName } = useDefaultBranch(params);
  const branchName = params.refName || defaultBranchName;
  const { mutateFn: fetch, ...res } = useMutation({
    hook: useFetchRemoteMutation,
  });

  const onClick = async () => {
    const fetchRes = await fetch({
      variables: {
        databaseName: params.databaseName,
        remoteName: remote.name,
        branchName,
      },
    });
    if (!fetchRes.data?.fetchRemote.success) {
      return;
    }

    setFetchModalOpen(true);
    fakeEscapePress();
  };

  return (
    <DropdownItem onClick={onClick} icon={<GoArrowDown />}>
      <div>
        <span>Fetch from remote</span>
        <ErrorMsg err={res.err} />
      </div>
    </DropdownItem>
  );
}
