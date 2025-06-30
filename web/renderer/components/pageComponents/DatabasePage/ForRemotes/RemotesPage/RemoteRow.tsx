import { DropdownItem } from "@components/DatabaseOptionsDropdown";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { ButtonWithPopup } from "@dolthub/react-components";
import { RemoteFragment } from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import { OptionalRefParams } from "@lib/params";
import { FaRegTrashAlt } from "@react-icons/all-files/fa/FaRegTrashAlt";
import { useState } from "react";
import FetchButton from "./FetchButton";
import FetchRemoteModal from "./FetchRemoteModal";
import css from "./index.module.css";

type Props = {
  remote: RemoteFragment;
  onDeleteClicked: () => void;
  params: OptionalRefParams;
};

export default function RemoteRow({ remote, onDeleteClicked, params }: Props) {
  const [open, setOpen] = useState(false);
  const [fetchModalOpen, setFetchModalOpen] = useState(false);
  const [fetchError, setFetchError] = useApolloError(undefined);

  return (
    <tr>
      <td data-cy={`remote-name-${remote.name.split(" ").join("-")}`}>
        {remote.name}
      </td>
      <td data-cy={`remote-url-${remote.name.split(" ").join("-")}`}>
        {remote.url}
      </td>
      <td>{remote.fetchSpecs?.join(",")}</td>
      <td>
        <HideForNoWritesWrapper params={params}>
          <ButtonWithPopup
            position="bottom center"
            keepTooltipInside
            contentStyle={{ width: "fit-content" }}
            offsetX={9}
            closeOnEscape
            buttonClassName={css.triggerButton}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            triggerText="Actions"
            open={open}
            data-cy={`remote-${remote.name}-action-button`}
          >
            <div>
              <ul data-cy="actions-dropdown">
                <FetchButton
                  setFetchModalOpen={setFetchModalOpen}
                  setErr={setFetchError}
                  params={params}
                  remote={remote}
                />
                <DropdownItem
                  onClick={onDeleteClicked}
                  icon={<FaRegTrashAlt className={css.trashIcon} />}
                  data-cy="delete-button"
                >
                  Remove remote
                </DropdownItem>
              </ul>
            </div>
          </ButtonWithPopup>
        </HideForNoWritesWrapper>
      </td>
      <FetchRemoteModal
        isOpen={fetchModalOpen}
        setIsOpen={setFetchModalOpen}
        params={params}
        remote={remote}
        err={fetchError}
      />
    </tr>
  );
}
