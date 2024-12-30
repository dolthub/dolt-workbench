import { RemoteFragment } from "@gen/graphql-types";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { ButtonWithPopup } from "@dolthub/react-components";
import { FaRegTrashAlt } from "@react-icons/all-files/fa/FaRegTrashAlt";
import { IoPushOutline } from "@react-icons/all-files/io5/IoPushOutline";
import { OptionalRefParams } from "@lib/params";
import { useState } from "react";
import { DropdownItem } from "@components/DatabaseOptionsDropdown";
import { fakeEscapePress } from "@dolthub/web-utils";
import PullFromRemoteModal from "./PullFromRemoteModal";
import PushToRemoteModal from "./PushToRemoteModal";
import FetchRemoteModal from "./FetchRemoteModal";
import FetchButton from "./FetchButton";
import css from "./index.module.css";

type Props = {
  remote: RemoteFragment;
  onDeleteClicked: () => void;
  params: OptionalRefParams;
};

export default function RemoteRow({ remote, onDeleteClicked, params }: Props) {
  const [open, setOpen] = useState(false);
  const [pullModalOpen, setPullModalOpen] = useState(false);
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [fetchModalOpen, setFetchModalOpen] = useState(false);

  return (
    <tr>
      <td>{remote.name}</td>
      <td>{remote.url}</td>
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
          >
            <div>
              <ul>
                <FetchButton
                  setFetchModalOpen={setFetchModalOpen}
                  params={params}
                  remote={remote}
                />
                <DropdownItem
                  onClick={() => {
                    setPullModalOpen(true);
                    fakeEscapePress();
                  }}
                  icon={<IoPushOutline className={css.pullIcon} />}
                >
                  Pull from remote
                </DropdownItem>
                <DropdownItem
                  onClick={() => {
                    setPushModalOpen(true);
                    fakeEscapePress();
                  }}
                  icon={<IoPushOutline />}
                >
                  Push to remote
                </DropdownItem>
                <DropdownItem
                  onClick={onDeleteClicked}
                  icon={<FaRegTrashAlt className={css.trashIcon} />}
                >
                  Remove remote
                </DropdownItem>
              </ul>
            </div>
          </ButtonWithPopup>
        </HideForNoWritesWrapper>
      </td>
      <PullFromRemoteModal
        isOpen={pullModalOpen}
        setIsOpen={setPullModalOpen}
        params={params}
        remote={remote}
      />
      <PushToRemoteModal
        isOpen={pushModalOpen}
        setIsOpen={setPushModalOpen}
        params={params}
        remote={remote}
      />
      <FetchRemoteModal
        isOpen={fetchModalOpen}
        setIsOpen={setFetchModalOpen}
        params={params}
        remote={remote}
      />
    </tr>
  );
}
