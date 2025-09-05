import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { FaPlay } from "@react-icons/all-files/fa/FaPlay";
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import { FaCheck } from "@react-icons/all-files/fa/FaCheck";
import { FaTimes } from "@react-icons/all-files/fa/FaTimes";
import { Button } from "@dolthub/react-components";
import { useState, KeyboardEvent, ChangeEvent, MouseEvent } from "react";
import css from "./index.module.css";

type Props = {
  group: string;
  isExpanded: boolean;
  onToggle: () => void;
  testCount: number;
  groupColor: string;
  groupResult?: 'passed' | 'failed';
  onRunGroup: () => void;
  onDeleteGroup: () => void;
  onRenameGroup?: (oldName: string, newName: string) => void;
};

export default function TestGroup({ group, isExpanded, onToggle, testCount, groupColor, groupResult, onRunGroup, onDeleteGroup, onRenameGroup }: Props) {
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
          {groupResult && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
              groupResult === 'passed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {groupResult === 'passed' ? (
                <>
                  <FaCheck className="w-3 h-3" />
                  <span>Passed</span>
                </>
              ) : (
                <>
                  <FaTimes className="w-3 h-3" />
                  <span>Failed</span>
                </>
              )}
            </div>
          )}
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
