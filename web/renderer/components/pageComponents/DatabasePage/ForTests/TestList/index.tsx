import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Button } from "@dolthub/react-components";
import { useState, useEffect } from "react";
import css from "./index.module.css";
import NewGroupModal from "../NewGroupModal";
import TestGroup from "@pageComponents/DatabasePage/ForTests/TestGroup";
import { useTestList } from "./useTestList";
import { RefParams } from "@lib/params";
import CreateDropdown from "./CreateDropdown";
import TestItemRenderer from "./TestItemRenderer";
import Link from "@components/links/Link";
import { workingDiff } from "@lib/urls";

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
    tests,
    groupedTests,
    sortedGroupEntries,
    testResults,
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
    handleRenameGroup,
    handleTestNameEdit,
    handleTestNameBlur,
    handleHashNavigation,
  } = useTestList(params);

  useEffect(() => {
    handleHashNavigation();
  }, [handleHashNavigation]);

  const onCreateGroup = () => {
    if (handleCreateGroup(newGroupName, groupedTests)) {
      setNewGroupName("");
      setShowNewGroupModal(false);
    }
  };

  const uniqueGroups = sortedGroupEntries
    .map(entry => entry[0])
    .filter(group => group !== "");

  return (
    <div className={css.container}>
      <div className={css.top}>
        <h1>Tests</h1>
        <div className={css.actionArea}>
          <div className={css.createActions}>
            <HideForNoWritesWrapper params={params}>
              <CreateDropdown
                onCreateTest={() => handleCreateTest()}
                onCreateGroup={() => setShowNewGroupModal(true)}
              />
            </HideForNoWritesWrapper>
            <Link {...workingDiff(params)}>
              <Button>Commit</Button>
            </Link>
          </div>

          <div className={css.primaryActions}>
            {tests.length > 0 && (
              <Button onClick={handleRunAll} className={css.runAllButton}>
                Run All
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
                return (
                  <div key={groupName} className={css.groupedTests}>
                    <TestGroup
                      group={groupName}
                      isExpanded={isGroupExpanded}
                      onToggle={() => toggleGroupExpanded(groupName)}
                      testCount={groupTests.length}
                      groupResult={getGroupResult(groupName)}
                      onRunGroup={async () => await handleRunGroup(groupName)}
                      onDeleteGroup={async () => handleDeleteGroup(groupName)}
                      onRenameGroup={handleRenameGroup}
                      onCreateTest={group => handleCreateTest(group)}
                    />
                    {isGroupExpanded && (
                      <ol className={css.groupedList}>
                        <TestItemRenderer
                          tests={groupTests}
                          uniqueGroups={uniqueGroups}
                          expandedItems={expandedItems}
                          editingTestNames={editingTestNames}
                          testResults={testResults}
                          onToggleExpanded={toggleExpanded}
                          onUpdateTest={updateTest}
                          onNameEdit={handleTestNameEdit}
                          onNameBlur={handleTestNameBlur}
                          onRunTest={handleRunTest}
                          onDeleteTest={handleDeleteTest}
                        />
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
                    <TestItemRenderer
                      tests={groupedTests[""]}
                      uniqueGroups={uniqueGroups}
                      expandedItems={expandedItems}
                      editingTestNames={editingTestNames}
                      testResults={testResults}
                      onToggleExpanded={toggleExpanded}
                      onUpdateTest={updateTest}
                      onNameEdit={handleTestNameEdit}
                      onNameBlur={handleTestNameBlur}
                      onRunTest={handleRunTest}
                      onDeleteTest={handleDeleteTest}
                    />
                  </ol>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <p className={css.noTests}>No tests found</p>
      )}
    </div>
  );
}
