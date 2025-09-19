import { Popup } from "@dolthub/react-components";
import { fakeEscapePress } from "@dolthub/web-utils";
import { FaCaretDown } from "@react-icons/all-files/fa/FaCaretDown";
import { FaCaretUp } from "@react-icons/all-files/fa/FaCaretUp";
import { FaFile } from "@react-icons/all-files/fa/FaFile";
import { FaFolder } from "@react-icons/all-files/fa/FaFolder";
import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
import css from "./index.module.css";

type Props = {
  onCreateTest: () => void;
  onCreateGroup: () => void;
};

export default function CreateDropdown({ onCreateTest, onCreateGroup }: Props) {
  return (
    <Popup
      position="bottom left"
      on={["click"]}
      offsetX={0}
      closeOnDocumentClick
      closeOnEscape
      trigger={(isOpen: boolean) => (
        <button className={css.createButton} type="button">
          <span className={css.plus}>
            <FiPlus />
          </span>
          <span>Create</span>
          <span className={css.caret}>
            {isOpen ? <FaCaretUp /> : <FaCaretDown />}
          </span>
        </button>
      )}
    >
      <div className={css.createPopup}>
        <ul>
          <li className={css.createPopupItem}>
            <button
              onClick={() => {
                onCreateTest();
                fakeEscapePress();
              }}
              type="button"
            >
              <FaFile />
              Create Test
            </button>
          </li>
          <li className={css.createPopupItem}>
            <button
              onClick={() => {
                onCreateGroup();
                fakeEscapePress();
              }}
              type="button"
            >
              <FaFolder />
              Create Group
            </button>
          </li>
        </ul>
      </div>
    </Popup>
  );
}
