import { fakeEscapePress } from "@dolthub/web-utils";
import { HiRefresh } from "@react-icons/all-files/hi/HiRefresh";
import { DropdownItem } from "@components/DatabaseOptionsDropdown";
import { RemoteFragment, useFetchRemoteLazyQuery } from "@gen/graphql-types";
import { OptionalRefParams } from "@lib/params";
import { SmallLoader } from "@dolthub/react-components";
import { useState } from "react";
import { SetApolloErrorType } from "@lib/errors/types";

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
  const [fetch] = useFetchRemoteLazyQuery();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    const fetchRes = await fetch({
      variables: {
        ...params,
        remoteName: remote.name,
      },
      fetchPolicy: "network-only",
    });
    setLoading(false);
    if (!fetchRes.data?.fetchRemote.success) {
      setErr(fetchRes.error || new Error("Fetch failed"));
      setFetchModalOpen(true);
      return;
    }

    setFetchModalOpen(true);
    fakeEscapePress();
  };

  return (
    <DropdownItem onClick={onClick} icon={<HiRefresh />}>
      <div>
        <SmallLoader loaded={!loading} />
        <span>Fetch from remote</span>
      </div>
    </DropdownItem>
  );
}
