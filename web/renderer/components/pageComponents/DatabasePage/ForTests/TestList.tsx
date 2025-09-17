import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Button, Popup } from "@dolthub/react-components";
import { useState, useEffect, useCallback } from "react";
import cx from "classnames";
import css from "./index.module.css";
import NewGroupModal from "./NewGroupModal";
import TestGroup from "./TestGroup";
import TestItem from "./TestItem";
import ConfirmationModal from "./ConfirmationModal";
import { useTestList } from "./useTestList";
import { RefParams } from "@lib/params";
import { FaCaretDown } from "@react-icons/all-files/fa/FaCaretDown";
import { FaCaretUp } from "@react-icons/all-files/fa/FaCaretUp";
import { FiPlus } from "@react-icons/all-files/fi/FiPlus";

type Props = {
  params: RefParams;
};

export default function TestList({ params }: Props) {
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [hasHandledHash, setHasHandledHash] = useState(false);
  
  const {
    expandedItems,
    expandedGroups,
    editingTestNames,
    hasUnsavedChanges,
    tests,
    groupedTests,
    sortedGroupEntries,
    testResults,
    showUnsavedModal,
    getGroupResult,
    toggleExpanded,
    toggleGroupExpanded,
    updateTest,
    handleRunTest,
    handleRunGroup,
    handleRunAll,
    handleDeleteTest,
    handleDeleteGroup,
    handleCreateGroup,
    handleCreateTest,
    handleSaveAll,
    handleRenameGroup,
    handleTestNameEdit,
    handleTestNameBlur,
    handleConfirmNavigation,
    handleCancelNavigation,
  } = useTestList(params);

  // Handle URL hash navigation to specific tests
  const handleHashNavigation = useCallback(() => {
    const hash = window.location.hash.slice(1);
    if (!hash || tests.length === 0 || hasHandledHash) return;

    const decodedHash = decodeURIComponent(hash);
    const targetTest = tests.find(test => test.testName === decodedHash);
    if (!targetTest) return;

    const containingGroup = Object.entries(groupedTests).find(
      ([, groupTests]) => groupTests.some(test => test.testName === decodedHash),
    )?.[0];

    if (containingGroup && containingGroup !== "" && !expandedGroups.has(containingGroup)) {
      toggleGroupExpanded(containingGroup);
    }

    if (!expandedItems.has(decodedHash)) {
      toggleExpanded(decodedHash);
    }

    setHasHandledHash(true);

    // scroll to the test after a short delay to ensure DOM is updated
    setTimeout(() => {
      const testElement = document.querySelector(`[data-test-name="${decodedHash}"]`);
      if (testElement) {
        testElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  }, [tests, groupedTests, expandedGroups, expandedItems, toggleGroupExpanded, toggleExpanded, hasHandledHash]);

  useEffect(() => {
    handleHashNavigation();
  }, [handleHashNavigation]);

  const onCreateGroup = () => {
    if (handleCreateGroup(newGroupName, groupedTests)) {
      setNewGroupName("");
      setShowNewGroupModal(false);
    }
  };

  const uniqueGroups = sortedGroupEntries.map(entry => entry[0]).filter(group => group !== "")

  const getGroupStatusColors = (groupTests: any[]) => {
    const groupTestResults = groupTests.map(test => testResults[test.testName]).filter(Boolean);
    
    if (groupTestResults.length === 0) {
      return { red: false, green: false, orange: true };
    }
    
    const hasFailures = groupTestResults.some(result => result && result.status === 'failed');
    if (hasFailures) {
      return { red: true, green: false, orange: false };
    }
    
    return { red: false, green: true, orange: false };
  };

  const getTestStatusColors = (testName: string) => {
    const testResult = testResults[testName];
    
    if (!testResult) {
      return { red: false, green: false, orange: true };
    }
    
    if (testResult.status === 'failed') {
      return { red: true, green: false, orange: false };
    }
    
    return { red: false, green: true, orange: false };
  };

  const CreateDropdown = () => (
    <Popup
      position="bottom left"
      on={["click"]}
      offsetX={0}
      closeOnDocumentClick
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
            <button onClick={() => handleCreateTest()} type="button">
              Create Test
            </button>
          </li>
          <li className={css.createPopupItem}>
            <button onClick={() => setShowNewGroupModal(true)} type="button">
              Create Group
            </button>
          </li>
        </ul>
      </div>
    </Popup>
  );

  return (
    <div className={css.container}>
      <div className={css.top}>
        <h1>Tests</h1>
        <div className={css.actionArea}>
          <div className={css.createActions}>
            <HideForNoWritesWrapper params={params}>
              <CreateDropdown />
            </HideForNoWritesWrapper>
          </div>
          
          <div className={css.primaryActions}>
            <HideForNoWritesWrapper params={params}>
              <Button
                onClick={handleSaveAll}
                disabled={!hasUnsavedChanges}
                className={hasUnsavedChanges ? 'bg-sky-600 text-white' : ''}
              >
                Save Changes
              </Button>
            </HideForNoWritesWrapper>
            {tests.length > 0 && (
              <Button
                onClick={handleRunAll}
                className="bg-green-600 text-white"
              >
                Run All Tests
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <NewGroupModal
        isOpen={showNewGroupModal}
        groupName={newGroupName}
        onGroupNameChange={setNewGroupName}
        onCreateGroup={onCreateGroup}
        onClose={() => setShowNewGroupModal(false)}
      />
      {tests.length ? (
        <div className={css.tagContainer}>
          <div className={css.list}>
            {sortedGroupEntries
              .filter(([groupName]) => groupName !== "")
              .map(([groupName, groupTests]) => {
                const isGroupExpanded = expandedGroups.has(groupName);
                const groupStatusColors = getGroupStatusColors(groupTests);

                return (
                  <div key={groupName} className={css.groupedTests}>
                      <TestGroup
                        group={groupName}
                        isExpanded={isGroupExpanded}
                        onToggle={() => toggleGroupExpanded(groupName)}
                        testCount={groupTests.length}
                        className={cx({
                          [css.greenGroup]: groupStatusColors.green,
                          [css.redGroup]: groupStatusColors.red,
                          [css.orangeGroup]: groupStatusColors.orange,
                        })}
                        groupResult={getGroupResult(groupName)}
                        onRunGroup={async () => await handleRunGroup(groupName)}
                        onDeleteGroup={async () => handleDeleteGroup(groupName)}
                        onRenameGroup={handleRenameGroup}
                      />
                    {isGroupExpanded && (
                      <ol className={css.groupedList}>
                        {groupTests.map((test) => {
                          const testStatusColors = getTestStatusColors(test.testName);
                          return (
                          <TestItem
                            key={test.testName}
                            test={test}
                            groupOptions={uniqueGroups}
                            isExpanded={expandedItems.has(test.testName)}
                            editingName={editingTestNames[test.testName]}
                            testResult={testResults[test.testName]}
                            className={cx({
                              [css.greenTest]: testStatusColors.green,
                              [css.redTest]: testStatusColors.red,
                              [css.orangeTest]: testStatusColors.orange,
                            })}
                            onToggleExpanded={() => toggleExpanded(test.testName)}
                            onUpdateTest={(field, value) => updateTest(test.testName, field, value)}
                            onNameEdit={(name) => handleTestNameEdit(test.testName, name)}
                            onNameBlur={() => handleTestNameBlur(test.testName)}
                            onRunTest={async () => await handleRunTest(test.testName)}
                            onDeleteTest={async () => await handleDeleteTest(test.testName)}
                          />
                          );
                        })}
                      </ol>
                    )}
                  </div>
                );
              })}
{(groupedTests[""] ?? []).length > 0 && (
              <>
                <div className={css.ungroupedDivider}>Ungrouped</div>
                <div className={css.ungroupedTests}>
                  <ol className={css.groupedList}>
                    {groupedTests[""].map((test) => {
                      const testStatusColors = getTestStatusColors(test.testName);
                      return (
                      <TestItem
                        key={test.testName}
                        test={test}
                        groupOptions={uniqueGroups}
                        isExpanded={expandedItems.has(test.testName)}
                        editingName={editingTestNames[test.testName]}
                        testResult={testResults[test.testName]}
                        className={cx({
                          [css.greenTest]: testStatusColors.green,
                          [css.redTest]: testStatusColors.red,
                          [css.orangeTest]: testStatusColors.orange,
                        })}
                        onToggleExpanded={() => toggleExpanded(test.testName)}
                        onUpdateTest={(field, value) => updateTest(test.testName, field, value)}
                        onNameEdit={(name) => handleTestNameEdit(test.testName, name)}
                        onNameBlur={() => handleTestNameBlur(test.testName)}
                        onRunTest={async () => await handleRunTest(test.testName)}
                        onDeleteTest={async () => await handleDeleteTest(test.testName)}
                      />
                      );
                    })}
                  </ol>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <p className={css.noTests}>
          No tests found
        </p>
      )}
      
      <ConfirmationModal
        isOpen={showUnsavedModal}
        title="Unsaved Changes"
        message="You have unsaved changes that will be lost if you leave this page. Are you sure you want to continue?"
        confirmText="Leave Page"
        cancelText="Stay Here"
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
        destructive={true}
      />
    </div>
  );
}
