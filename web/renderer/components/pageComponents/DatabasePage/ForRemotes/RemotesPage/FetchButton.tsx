import { fakeEscapePress } from "@dolthub/web-utils";
import { GoArrowDown } from "@react-icons/all-files/go/GoArrowDown";
import { DropdownItem } from "@components/DatabaseOptionsDropdown";
import { RemoteFragment, useFetchRemoteLazyQuery } from "@gen/graphql-types";
import { OptionalRefParams } from "@lib/params";
import useDefaultBranch from "@hooks/useDefaultBranch";
import { ErrorMsg, SmallLoader } from "@dolthub/react-components";
import useApolloError from "@hooks/useApolloError";
import { useState } from "react";

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
  const [fetch] = useFetchRemoteLazyQuery();
  const [err, setErr] = useApolloError(undefined);
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    const fetchRes = await fetch({
      variables: {
        databaseName: params.databaseName,
        remoteName: remote.name,
        branchName,
      },
    });
    setLoading(false);
    if (!fetchRes.data?.fetchRemote.success) {
      setErr(fetchRes.error || new Error("Fetch failed"));
      return;
    }

    setFetchModalOpen(true);
    fakeEscapePress();
  };

  return (
    <DropdownItem onClick={onClick} icon={<GoArrowDown />}>
      <>
        <SmallLoader loaded={!loading} />
        <div>
          <span>Fetch from remote</span>
          <ErrorMsg err={err} />
        </div>
      </>
    </DropdownItem>
  );
}
