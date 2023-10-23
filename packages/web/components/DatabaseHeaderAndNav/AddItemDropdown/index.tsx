import Popup from "@components/Popup";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import useRole from "@hooks/useRole";
import { DatabaseParams } from "@lib/params";
import { newRelease } from "@lib/urls";
import { AiOutlineTag } from "@react-icons/all-files/ai/AiOutlineTag";
import { FaCaretDown } from "@react-icons/all-files/fa/FaCaretDown";
import { FaCaretUp } from "@react-icons/all-files/fa/FaCaretUp";
import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
import DocsDropdownItem from "./DocItem";
import DropdownItem from "./Item";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams & { refName?: string };
};

export default function AddItemDropdown(props: Props) {
  const { userHasWritePerms, canWriteToDB } = useRole();

  if (!canWriteToDB) return null;

  return (
    <div className={css.addDropdown} data-cy="add-dropdown-database-nav">
      <Popup
        position="bottom right"
        on={["click"]}
        offsetX={24}
        closeOnDocumentClick
        trigger={Trigger}
      >
        <div className={css.popup}>
          <ul>
            {/* <DropdownItem
              url={upload(props.params)}
              icon={<AiOutlineUpload />}
              data-cy="add-dropdown-upload-a-file-link"
            >
              Upload a file
            </DropdownItem> */}
            {/* <DropdownItem
              url={newPull(props.params)}
              icon={<AiOutlinePullRequest />}
              data-cy="add-dropdown-new-pull-request-link"
            >
              New pull request
            </DropdownItem> */}
            <NotDoltWrapper>
              <DropdownItem
                url={newRelease(props.params)}
                icon={<AiOutlineTag />}
                data-cy="add-dropdown-new-release-link"
                hide={!userHasWritePerms}
              >
                New release
              </DropdownItem>
            </NotDoltWrapper>
            {props.params.refName && (
              <NotDoltWrapper>
                <DocsDropdownItem
                  params={{ ...props.params, refName: props.params.refName }}
                  userHasWritePerms={userHasWritePerms}
                />
              </NotDoltWrapper>
            )}
          </ul>
        </div>
      </Popup>
    </div>
  );
}

function Trigger(isOpen: boolean) {
  return (
    <button data-cy="add-dropdown-button" className={css.button} type="button">
      <span className={css.plus}>
        <FiPlus />
      </span>
      <span>Add</span>
      <span className={css.caret}>
        {isOpen ? <FaCaretUp /> : <FaCaretDown />}
      </span>
    </button>
  );
}
