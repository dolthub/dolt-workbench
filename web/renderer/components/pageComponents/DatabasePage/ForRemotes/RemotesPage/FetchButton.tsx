import { DropdownItem } from "@components/DatabaseOptionsDropdown";
import { SmallLoader } from "@dolthub/react-components";
import { fakeEscapePress } from "@dolthub/web-utils";
import { RemoteFragment, useFetchRemoteMutation } from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { SetApolloErrorType } from "@lib/errors/types";
import { OptionalRefParams } from "@lib/params";
import { HiRefresh } from "@react-icons/all-files/hi/HiRefresh";

type Props = {
  setFetchModalOpen: (f: boolean) => void;
  setErr: SetApolloErrorType;
  params: OptionalRefParams;
  remote: RemoteFragment;
};

export default function FetchButton({
  setFetchModalOpen,
  setErr,
  params,
  remote,
}: Props) {
  const {
    mutateFn: fetch,
    err,
    loading,
  } = useMutation({ hook: useFetchRemoteMutation });

  const onClick = async () => {
    const fetchRes = await fetch({
      variables: {
        databaseName: params.databaseName,
        remoteName: remote.name,
      },
      fetchPolicy: "network-only",
    });
    if (!fetchRes.data?.fetchRemote.success) {
      setErr(err ?? new Error("Fetch failed"));
      setFetchModalOpen(true);
      return;
    }

    setFetchModalOpen(true);
    fakeEscapePress();
  };

  return (
    <DropdownItem onClick={onClick} icon={<HiRefresh />} data-cy="fetch-button">
      <div>
        <SmallLoader loaded={!loading} />
        <span>Manage remote branches</span>
      </div>
    </DropdownItem>
  );
}
