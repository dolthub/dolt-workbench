import { useState, useMemo, useEffect, useRef } from "react";
import {
  Test, TestResult,
  useRunTestsLazyQuery,
  useSaveTestsMutation,
  useTestListQuery,
} from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { useRouter } from "next/router";

export function useTestList(params: RefParams) {
  const router = useRouter();
  const { data } = useTestListQuery({
    variables: {
      databaseName: params.databaseName,
      refName: params.refName,
    },
  });
  const [runTests] = useRunTestsLazyQuery();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingTestNames, setEditingTestNames] = useState<
    Record<string, string>
  >({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [tests, setTests] = useState<Test[]>([]);
  const [emptyGroups, setEmptyGroups] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<
    Record<string, { status: "passed" | "failed"; error?: string } | undefined>
  >({});
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  const autoRunExecutedRef = useRef(false);

  const getResults = (testResults: TestResult[]): Record<string, { status: "passed" | "failed"; error?: string }> => {
    const results: Record<string, { status: "passed" | "failed"; error?: string }> = {};
    for (const testResult of testResults) {
      if (testResult.status === "PASS") {
        results[testResult.testName] = {
          status: "passed",
        };
      } else {
        results[testResult.testName] = {
          status: "failed",
          error: testResult.message,
        };
      }
    }
    return results;
  }

  useEffect(() => {
    if (data?.tests.list) {
      const initialTests = data.tests.list.map(
        ({ __typename, ...test }) => test,
      );
      setTests(initialTests);
    }
  }, [data?.tests.list]);

  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      setShowUnsavedModal(false);

      const url = pendingNavigation;
      setPendingNavigation(null);
      setHasUnsavedChanges(false); // Clear unsaved changes to allow navigation

      setTimeout(async () => {
        await router.push(url);
      });
    }
  };

  const handleCancelNavigation = () => {
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    const handleRouteChangeStart = (url: string) => {
      if (hasUnsavedChanges && router.asPath !== url) {
        setPendingNavigation(url);
        setShowUnsavedModal(true);
        router.events.emit("routeChangeError");
        throw "Route change aborted by user";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    router.events.on("routeChangeStart", handleRouteChangeStart);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [hasUnsavedChanges, router]);

  useEffect(() => {
    const shouldRunTests = router.query.runTests === "true";

    if (shouldRunTests) {
      autoRunExecutedRef.current = false;
    }

    if (shouldRunTests && tests.length > 0 && !autoRunExecutedRef.current) {
      const runAllTests = async () => {
        autoRunExecutedRef.current = true;
        try {
          const result = await runTests({
            variables: {
              databaseName: params.databaseName,
              refName: params.refName,
            },
          });

          const testResultsList = result.data?.runTests.list || [];
          const allResults = getResults(testResultsList);

          setTestResults(allResults);
        } catch (error) {
          console.error("Error auto-running tests:", error);
        }
      };

      void runAllTests();
    }
  }, [
    router.query.runTests,
    tests.length,
    router,
    runTests,
    params.databaseName,
    params.refName,
    data?.tests.list,
  ]);

  const [saveTestsMutation] = useSaveTestsMutation({
    variables: {
      databaseName: params.databaseName,
      refName: params.refName,
      tests: { list: tests },
    },
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const toggleGroupExpanded = (groupName: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupName)) {
      newExpandedGroups.delete(groupName);
    } else {
      newExpandedGroups.add(groupName);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const updateTest = (name: string, field: keyof Test, value: string) => {
    setTests(
      tests.map((test: Test) =>
        test.testName === name ? { ...test, [field]: value } : test,
      ),
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = async () => {
    console.log("Saving all changes:", tests);
    await saveTestsMutation();
    setHasUnsavedChanges(false);
  };

  const handleRunTest = async (testName: string) => {
    if (hasUnsavedChanges) {
      await handleSaveAll();
    }
    const result = await runTests({
      variables: {
        databaseName: params.databaseName,
        refName: params.refName,
        identifiers: {
          values: [testName],
        },
      },
    });

    const testPassed =
      result.data &&
      result.data.runTests.list.length > 0 &&
      result.data.runTests.list[0].status === "PASS";

    setTestResults(prev => {
      return {
        ...prev,
        [testName]: {
          status: testPassed ? "passed" : "failed",
          error: testPassed ? undefined : result.data?.runTests.list[0].message,
        },
      };
    });
  };

  const handleRunGroup = async (groupName: string) => {
    if (hasUnsavedChanges) {
      await handleSaveAll();
    }

    const result = await runTests({
      variables: {
        databaseName: params.databaseName,
        refName: params.refName,
        identifiers: {
          values: [groupName],
        },
      },
    });
    result.data?.runTests.list.map(test =>
      test.status === "PASS"
        ? {
            status: "passed",
          }
        : {
            status: "failed",
            error: test.message,
          },
    );

    const testResults =
      result.data && result.data.runTests.list.length > 0
        ? result.data.runTests.list
        : [];
    const groupResults = getResults(testResults);

    setTestResults(prev => {
      return {
        ...prev,
        ...groupResults,
      };
    });
  };
  const handleRunAll = async () => {
    if (hasUnsavedChanges) {
      await handleSaveAll();
    }

    const result = await runTests({
      variables: {
        databaseName: params.databaseName,
        refName: params.refName,
      },
    });

    const testResults =
      result.data && result.data.runTests.list.length > 0
        ? result.data.runTests.list
        : [];
    const allResults = getResults(testResults);

    setTestResults(prev => {
      return {
        ...prev,
        ...allResults,
      };
    });
  };

  const handleDeleteTest = async (testName: string) => {
    setTests(tests.filter(test => test.testName !== testName));
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(testName);
      return newSet;
    });
    await handleSaveAll();
  };

  const handleDeleteGroup = async (groupName: string) => {
    setTests(tests.filter(test => test.testGroup !== groupName));
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      newSet.delete(groupName);
      return newSet;
    });
    setEmptyGroups(prev => {
      const newSet = new Set(prev);
      newSet.delete(groupName);
      return newSet;
    });
    await handleSaveAll();
  };

  const handleCreateGroup = (
    groupName: string,
    groupedTests: Record<string, Test[]>,
  ) => {
    if (
      groupName.trim() &&
      !Object.keys(groupedTests).includes(groupName.trim()) &&
      !emptyGroups.has(groupName.trim())
    ) {
      setEmptyGroups(prev => new Set([...prev, groupName.trim()]));
      setExpandedGroups(prev => new Set([...prev, groupName.trim()]));
      setHasUnsavedChanges(true);
      return true;
    }
    return false;
  };

  const handleCreateTest = (groupName?: string) => {
    const baseTestName = "New Test";
    const existingNames = tests.map(t => t.testName);
    let uniqueTestName = baseTestName;
    let counter = 1;

    while (existingNames.includes(uniqueTestName)) {
      uniqueTestName = `${baseTestName} ${counter}`;
      counter += 1;
    }

    const newTest: Test = {
      testName: uniqueTestName,
      testQuery: "",
      assertionType: "expected_single_value",
      assertionComparator: "==",
      assertionValue: "",
      testGroup: groupName ?? "",
    };

    setTests([...tests, newTest]);
    setExpandedItems(prev => new Set([...prev, newTest.testName]));
    setEditingTestNames(prev => {
      return { ...prev, [newTest.testName]: newTest.testName };
    });
    setHasUnsavedChanges(true);

    if (groupName && emptyGroups.has(groupName)) {
      setEmptyGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupName);
        return newSet;
      });
    }

    if (groupName && !expandedGroups.has(groupName)) {
      setExpandedGroups(prev => new Set([...prev, groupName]));
    }

    setTimeout(() => {
      const testElement = document.querySelector(
        `[data-test-name="${newTest.testName}"]`,
      );
      testElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleRenameGroup = (oldName: string, newName: string) => {
    if (newName.trim() && oldName !== newName.trim()) {
      setTests(
        tests.map(test =>
          test.testGroup === oldName
            ? { ...test, testGroup: newName.trim() }
            : test,
        ),
      );

      setExpandedGroups(prev => {
        const newSet = new Set(prev);
        if (newSet.has(oldName)) {
          newSet.delete(oldName);
          newSet.add(newName.trim());
        }
        return newSet;
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleTestNameEdit = (testId: string, name: string) => {
    setEditingTestNames(prev => {
      return {
        ...prev,
        [testId]: name,
      };
    });
  };

  const handleTestNameBlur = (testName: string) => {
    const newName = editingTestNames[testName];
    const test = tests.find(t => t.testName === testName);
    if (newName.trim() && newName !== test?.testName) {
      updateTest(testName, "testName", newName.trim());
    }
    setEditingTestNames(prev => {
      const newState = { ...prev };
      delete newState[testName];
      return newState;
    });
  };

  const groupedTests = useMemo(() => {
    const groups: Record<string, Test[]> = {};
    tests.forEach(test => {
      const groupName = test.testGroup || "";
      groups[groupName] ??= [];
      groups[groupName].push(test);
    });

    emptyGroups.forEach(groupName => {
      groups[groupName] ??= [];
    });

    return groups;
  }, [tests, emptyGroups]);

  const sortedGroupEntries = useMemo(() => {
    const entries = Object.entries(groupedTests);
    const groupOrder = entries.map(entry => entry[0]);

    entries.sort(([a], [b]) => {
      if (a === "" && b === "") return 0;
      if (a === "") return 1;
      if (b === "") return -1;

      const indexA = groupOrder.indexOf(a);
      const indexB = groupOrder.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      return a.localeCompare(b);
    });

    return entries;
  }, [groupedTests]);

  const getGroupResult = (groupName: string) => {
    const groupTests = groupedTests[groupName];
    if (groupTests.length === 0) return undefined;

    const results = groupTests.map(test => testResults[test.testName]);

    if (results.some(result => !result)) return undefined;

    const allPassed = results.every(result => result?.status === "passed");
    return allPassed ? "passed" : "failed";
  };

  return {
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
  };
}
