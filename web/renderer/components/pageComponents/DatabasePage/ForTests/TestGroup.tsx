import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { FaPlay } from "@react-icons/all-files/fa/FaPlay";
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import { Button } from "@dolthub/react-components";
import { useState, KeyboardEvent, ChangeEvent, MouseEvent } from "react";
import css from "./index.module.css";

type Props = {
  group: string;
  isExpanded: boolean;
  onToggle: () => void;
  testCount: number;
  groupColor: string;
  onRunGroup: () => void;
  onDeleteGroup: () => void;
  onRenameGroup?: (oldName: string, newName: string) => void;
};

export default function TestGroup({ group, isExpanded, onToggle, testCount, groupColor, onRunGroup, onDeleteGroup, onRenameGroup }: Props) {
  const groupName = group || "No Group";
  const [localGroupName, setLocalGroupName] = useState(groupName);
  const [isEditing, setIsEditing] = useState(false);

  const handleRunGroup = (e: MouseEvent) => {
    e.stopPropagation();
    onRunGroup();
  };

  const handleDeleteGroup = (e: MouseEvent) => {
    e.stopPropagation();
    onDeleteGroup();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalGroupName(e.target.value);
  };

  const handleInputBlur = () => {
    if (localGroupName.trim() && localGroupName !== groupName) {
      onRenameGroup?.(groupName, localGroupName.trim());
    } else {
      setLocalGroupName(groupName);
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setLocalGroupName(groupName);
      setIsEditing(false);
    }
  };

  const handleHeaderClick = () => {
    if (!isEditing) {
      onToggle();
    }
  };

  return (
    <div className={`${css.groupHeader} ${isExpanded ? css.groupExpanded : ''}`} style={{ borderLeftColor: groupColor }} onClick={handleHeaderClick}>
      <div className={css.groupHeaderContent}>
        <div className={css.groupHeaderLeft}>
          <FaChevronRight className={css.groupExpandIcon} />
          <input
            className={css.inlineEditInput}
            value={localGroupName}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setIsEditing(true)}
            onClick={(e) => e.stopPropagation()}
          />
          <span className={css.testCount}>({testCount} tests)</span>
        </div>
        <div className={css.groupHeaderRight}>
          <Button.Link
            onClick={handleRunGroup}
            className={`${css.groupActionBtn} ${css.runBtn}`}
            data-tooltip-content={`Run all tests in ${groupName}`}
          >
            <FaPlay />
          </Button.Link>
          <Button.Link
            onClick={handleDeleteGroup}
            red
            className={css.groupActionBtn}
            data-tooltip-content={`Delete ${groupName} group`}
          >
            <FaTrash />
          </Button.Link>
        </div>
      </div>
    </div>
  );
}
