import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Button } from "@dolthub/react-components";
import { useState } from "react";
import css from "./index.module.css";
import NewGroupModal from "./NewGroupModal";
import TestGroup from "./TestGroup";
import TestItem from "./TestItem";
import ConfirmationModal from "./ConfirmationModal";
import { useTestList } from "./useTestList";
import { RefParams } from "@lib/params";

type Props = {
  params: RefParams;
};

export default function TestList({ params }: Props) {
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  
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
    pendingNavigation,
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

  // Debug: Log testResults to see if they're being received in the UI
  console.log('DEBUG TestList: testResults state:', testResults);

  const onCreateGroup = () => {
    if (handleCreateGroup(newGroupName, groupedTests)) {
      setNewGroupName("");
      setShowNewGroupModal(false);
    }
  };

  const uniqueGroups = sortedGroupEntries.map(entry => entry[0]).filter(group => group !== "")

  return (
    <div className={css.container}>
      <div className={css.top}>
        <h1>Tests</h1>
        <div className={css.createButtons}>
          <HideForNoWritesWrapper params={params}>
            <>
              <Button onClick={() => handleCreateTest()}>
                Create Test
              </Button>
              <Button onClick={() => setShowNewGroupModal(true)}>
                Create Group
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={!hasUnsavedChanges}
                className={hasUnsavedChanges ? 'bg-sky-600 text-white' : ''}
              >
                Save
              </Button>
            </>
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
                const groupColor = "#f59e0b";

                return (
                  <div key={groupName} className={css.groupedTests}>
                      <TestGroup
                        group={groupName}
                        isExpanded={isGroupExpanded}
                        onToggle={() => toggleGroupExpanded(groupName)}
                        testCount={groupTests.length}
                        groupColor={groupColor}
                        groupResult={getGroupResult(groupName)}
                        onRunGroup={async () => await handleRunGroup(groupName)}
                        onDeleteGroup={() => handleDeleteGroup(groupName)}
                        onRenameGroup={handleRenameGroup}
                      />
                    {isGroupExpanded && (
                      <ol className={css.groupedList}>
                        {groupTests.map((test) => (
                          <TestItem
                            key={test.testName}
                            test={test}
                            groupOptions={uniqueGroups}
                            isExpanded={expandedItems.has(test.testName)}
                            editingName={editingTestNames[test.testName]}
                            testResult={testResults[test.testName]}
                            onToggleExpanded={() => toggleExpanded(test.testName)}
                            onUpdateTest={(field, value) => updateTest(test.testName, field, value)}
                            onNameEdit={(name) => handleTestNameEdit(test.testName, name)}
                            onNameBlur={() => handleTestNameBlur(test.testName)}
                            onRunTest={async () => await handleRunTest(test.testName)}
                            onDeleteTest={() => handleDeleteTest(test.testName)}
                          />
                        ))}
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
                    {groupedTests[""].map((test) => (
                      <TestItem
                        key={test.testName}
                        test={test}
                        groupOptions={uniqueGroups}
                        isExpanded={expandedItems.has(test.testName)}
                        editingName={editingTestNames[test.testName]}
                        testResult={testResults[test.testName]}
                        onToggleExpanded={() => toggleExpanded(test.testName)}
                        onUpdateTest={(field, value) => updateTest(test.testName, field, value)}
                        onNameEdit={(name) => handleTestNameEdit(test.testName, name)}
                        onNameBlur={() => handleTestNameBlur(test.testName)}
                        onRunTest={async () => await handleRunTest(test.testName)}
                        onDeleteTest={() => handleDeleteTest(test.testName)}
                      />
                    ))}
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
