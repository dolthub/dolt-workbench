import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Button, ErrorMsg } from "@dolthub/react-components";
import { useState, useEffect } from "react";
import css from "./index.module.css";
import NewGroupModal from "../NewGroupModal";
import TestGroup from "@pageComponents/DatabasePage/ForTests/TestGroup";
import { useTestContext } from "../context";
import CreateDropdown from "./CreateDropdown";
import Link from "@components/links/Link";
import { workingDiff } from "@lib/urls";
import { Test } from "@gen/graphql-types";
import TestItem from "@pageComponents/DatabasePage/ForTests/TestItem";
import { RefParams } from "@lib/params";

type Props = {
  params: RefParams;
};

export default function TestList({ params }: Props) {
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const {
    state,
    setState,
    groupedTests,
    sortedGroupEntries,
    testsLoading,
    testsError,
    handleRunAll,
    handleHashNavigation,
  } = useTestContext();

  useEffect(() => {
    handleHashNavigation();
  }, [handleHashNavigation]);

  const handleCreateGroup = (
    groupName: string,
    groupedTests: Record<string, Test[]>,
  ) => {
    if (
      groupName.trim() &&
      !Object.keys(groupedTests).includes(groupName.trim()) &&
      !state.emptyGroups.has(groupName.trim())
    ) {
      setState({
        emptyGroups: new Set([...state.emptyGroups, groupName.trim()]),
        expandedGroups: new Set([...state.expandedGroups, groupName.trim()]),
      });
      return true;
    }
    return false;
  };

  const onCreateGroup = () => {
    if (handleCreateGroup(newGroupName, groupedTests)) {
      setNewGroupName("");
      setShowNewGroupModal(false);
    }
  };

  const getTestItems = (testItems: Test[]) =>
    testItems.map(test => <TestItem key={test.testName} test={test} />);
  return (
    <div className={css.container}>
      <div className={css.top}>
        <h1>Tests</h1>
        {!testsLoading && !testsError && (
          <div className={css.actionArea}>
            <div className={css.createActions}>
              <HideForNoWritesWrapper params={params}>
                <CreateDropdown
                  onCreateGroup={() => setShowNewGroupModal(true)}
                />
              </HideForNoWritesWrapper>
              <Link {...workingDiff(params)}>
                <Button>Commit</Button>
              </Link>
            </div>

            <div className={css.primaryActions}>
              {state.tests.length > 0 && (
                <Button onClick={handleRunAll} className={css.runAllButton}>
                  Run All
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <NewGroupModal
        isOpen={showNewGroupModal}
        groupName={newGroupName}
        onGroupNameChange={setNewGroupName}
        onCreateGroup={onCreateGroup}
        onClose={() => setShowNewGroupModal(false)}
      />
      {state.tests.length ? (
        <div className={css.tagContainer}>
          <div className={css.list}>
            {sortedGroupEntries
              .filter(([groupName]) => groupName !== "")
              .map(([groupName, groupTests]) => {
                const isGroupExpanded = state.expandedGroups.has(groupName);
                return (
                  <div key={groupName} className={css.groupedTests}>
                    <TestGroup group={groupName} />
                    {isGroupExpanded && (
                      <ol className={css.groupedList}>
                        {getTestItems(groupTests)}
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
                    {getTestItems(groupedTests[""])}
                  </ol>
                </div>
              </>
            )}
          </div>
        </div>
      ) : testsError ? (
        <ErrorMsg err={new Error(testsError)} />
      ) : testsLoading ? (
        <p className={css.loading}>Loading tests...</p>
      ) : (
        <p className={css.noTests}>No tests found</p>
      )}
    </div>
  );
}
