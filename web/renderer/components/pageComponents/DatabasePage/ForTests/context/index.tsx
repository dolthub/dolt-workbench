import { createCustomContext } from "@dolthub/react-contexts";
import { useContextWithError, useSetState } from "@dolthub/react-hooks";
import {
  Test,
  useRunTestsLazyQuery,
  useSaveTestsMutation,
  useTestListQuery,
} from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { useRouter } from "next/router";
import { ReactNode, useMemo, useEffect, useRef, useCallback } from "react";
import { TestContextType, defaultState } from "./state";
import { getResults, groupTests, sortGroupEntries } from "../utils";

export const TestContext = createCustomContext<TestContextType>("TestContext");

type Props = {
  children: ReactNode;
  params: RefParams;
};

export function TestProvider({ children, params }: Props) {
  const router = useRouter();
  const {
    data,
    loading: testsLoading,
    error: testsError,
  } = useTestListQuery({
    variables: {
      databaseName: params.databaseName,
      refName: params.refName,
    },
  });

  const [
    {
      expandedItems,
      expandedGroups,
      editingTestNames,
      hasUnsavedChanges,
      tests,
      emptyGroups,
      testResults,
      hasHandledHash,
    },
    setState,
  ] = useSetState(defaultState);

  const [runTests] = useRunTestsLazyQuery();
  const autoRunExecutedRef = useRef(false);

  const [saveTestsMutation] = useSaveTestsMutation({
    variables: {
      databaseName: params.databaseName,
      refName: params.refName,
      tests: {
        list: tests.map(
          ({ _id, databaseName: _databaseName, refName: _refName, ...test }) =>
            test,
        ),
      },
    },
  });

  const handleSaveAll = useCallback(async () => {
    console.log("Saving all changes:", tests);
    await saveTestsMutation();
  }, [saveTestsMutation, tests]);

  useEffect(() => {
    if (testsError) {
      console.error("Error loading tests:", testsError);
    }
  }, [testsError]);

  useEffect(() => {
    if (data?.tests.list) {
      const initialTests = data.tests.list.map(
        ({ __typename, ...test }) => test,
      );
      setState({ tests: initialTests });
    }
  }, [data?.tests.list, setState]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const save = async () => {
      await handleSaveAll();
      setState({ hasUnsavedChanges: false });
    };
    void save();
  }, [hasUnsavedChanges, handleSaveAll, setState]);

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

          const testResultsList = result.data?.runTests.list ?? [];
          const allResults = getResults(testResultsList);

          setState({ testResults: allResults });
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
    setState,
  ]);

  const toggleExpanded = useCallback(
    (testName: string) => {
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(testName)) {
        newExpanded.delete(testName);
      } else {
        newExpanded.add(testName);
      }
      setState({ expandedItems: newExpanded });
    },
    [expandedItems, setState],
  );

  const toggleGroupExpanded = useCallback(
    (groupName: string) => {
      const newExpandedGroups = new Set(expandedGroups);
      if (newExpandedGroups.has(groupName)) {
        newExpandedGroups.delete(groupName);
      } else {
        newExpandedGroups.add(groupName);
      }
      setState({ expandedGroups: newExpandedGroups });
    },
    [expandedGroups, setState],
  );

  const handleTestError = useCallback(
    (error: string, targetTests: Test[]) => {
      const errorResults = targetTests.reduce(
        (acc, test) => {
          acc[test.testName] = {
            status: "failed",
            error,
          };
          return acc;
        },
        {} as Record<string, { status: "passed" | "failed"; error?: string }>,
      );

      setState({
        testResults: {
          ...testResults,
          ...errorResults,
        },
      });
    },
    [testResults, setState],
  );

  const handleRunTest = useCallback(
    async (testName: string) => {
      try {
        const result = await runTests({
          variables: {
            databaseName: params.databaseName,
            refName: params.refName,
            testIdentifier: {
              testName,
            },
          },
        });

        if (result.error) {
          console.error("Error running test:", result.error);
          const targetTest = tests.find(t => t.testName === testName);
          if (targetTest) {
            handleTestError(result.error.message, [targetTest]);
          }
          return;
        }

        const testPassed =
          result.data &&
          result.data.runTests.list.length > 0 &&
          result.data.runTests.list[0].status === "PASS";

        setState({
          testResults: {
            ...testResults,
            [testName]: {
              status: testPassed ? "passed" : "failed",
              error: testPassed
                ? undefined
                : result.data?.runTests.list[0].message,
            },
          },
        });
      } catch (err) {
        console.error("Error running test:", err);
        const targetTest = tests.find(t => t.testName === testName);
        if (targetTest) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to run test";
          handleTestError(errorMessage, [targetTest]);
        }
      }
    },
    [
      runTests,
      params.databaseName,
      params.refName,
      testResults,
      setState,
      tests,
      handleTestError,
    ],
  );

  const handleRunGroup = useCallback(
    async (groupName: string) => {
      try {
        const result = await runTests({
          variables: {
            databaseName: params.databaseName,
            refName: params.refName,
            testIdentifier: {
              groupName,
            },
          },
        });

        if (result.error) {
          console.error("Error running group tests:", result.error);
          const groupTests = tests.filter(test => test.testGroup === groupName);
          handleTestError(result.error.message, groupTests);
          return;
        }

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

        const testResultsList =
          result.data && result.data.runTests.list.length > 0
            ? result.data.runTests.list
            : [];
        const groupResults = getResults(testResultsList);

        setState({
          testResults: {
            ...testResults,
            ...groupResults,
          },
        });
      } catch (err) {
        console.error("Error running group tests:", err);
        const groupTests = tests.filter(test => test.testGroup === groupName);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to run group tests";
        handleTestError(errorMessage, groupTests);
      }
    },
    [
      runTests,
      params.databaseName,
      params.refName,
      testResults,
      setState,
      tests,
      handleTestError,
    ],
  );

  const handleRunAll = useCallback(async () => {
    try {
      const result = await runTests({
        variables: {
          databaseName: params.databaseName,
          refName: params.refName,
        },
      });

      if (result.error) {
        console.error("Error running all tests:", result.error);
        handleTestError(result.error.message, tests);
        return;
      }

      const testResultsList =
        result.data && result.data.runTests.list.length > 0
          ? result.data.runTests.list
          : [];
      const allResults = getResults(testResultsList);

      setState({
        testResults: {
          ...testResults,
          ...allResults,
        },
      });
    } catch (err) {
      console.error("Error running all tests:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to run all tests";
      handleTestError(errorMessage, tests);
    }
  }, [
    runTests,
    params.databaseName,
    params.refName,
    testResults,
    setState,
    tests,
    handleTestError,
  ]);

  const handleCreateTest = useCallback(
    (groupName?: string) => {
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
        testQuery: "SELECT * FROM tablename",
        assertionType: "expected_rows",
        assertionComparator: "==",
        assertionValue: "",
        testGroup: groupName ?? "",
        _id: "",
        databaseName: params.databaseName,
        refName: params.refName,
      };

      setState({
        tests: [...tests, newTest],
        expandedItems: new Set([...expandedItems, newTest.testName]),
        editingTestNames: {
          ...editingTestNames,
          [newTest.testName]: newTest.testName,
        },
        hasUnsavedChanges: true,
      });

      if (groupName && emptyGroups.has(groupName)) {
        const newEmptyGroups = new Set(emptyGroups);
        newEmptyGroups.delete(groupName);
        setState({ emptyGroups: newEmptyGroups });
      }

      if (groupName && !expandedGroups.has(groupName)) {
        setState({ expandedGroups: new Set([...expandedGroups, groupName]) });
      }

      setTimeout(() => {
        const testElement = document.querySelector(
          `[data-test-name="${newTest.testName}"]`,
        );
        testElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    },
    [
      tests,
      expandedItems,
      editingTestNames,
      emptyGroups,
      expandedGroups,
      params.databaseName,
      params.refName,
      setState,
    ],
  );

  const groupedTests = useMemo(
    () => groupTests(tests, emptyGroups),
    [tests, emptyGroups],
  );

  const sortedGroupEntries = useMemo(
    () => sortGroupEntries(groupedTests),
    [groupedTests],
  );

  const handleHashNavigation = useCallback(() => {
    const hash = window.location.hash.slice(1);
    if (!hash || tests.length === 0 || hasHandledHash) return;

    const decodedHash = decodeURIComponent(hash);
    const targetTest = tests.find(test => test.testName === decodedHash);
    if (!targetTest) return;

    const containingGroup = Object.entries(groupedTests).find(
      ([, groupTests]) =>
        groupTests.some(test => test.testName === decodedHash),
    )?.[0];

    if (
      containingGroup &&
      containingGroup !== "" &&
      !expandedGroups.has(containingGroup)
    ) {
      toggleGroupExpanded(containingGroup);
    }

    if (!expandedItems.has(decodedHash)) {
      toggleExpanded(decodedHash);
    }

    setState({ hasHandledHash: true });

    setTimeout(() => {
      const testElement = document.querySelector(
        `[data-test-name="${decodedHash}"]`,
      );
      if (testElement) {
        testElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  }, [
    tests,
    groupedTests,
    expandedGroups,
    expandedItems,
    toggleGroupExpanded,
    toggleExpanded,
    hasHandledHash,
    setState,
  ]);

  const value = useMemo(() => {
    return {
      expandedItems,
      expandedGroups,
      emptyGroups,
      editingTestNames,
      tests,
      groupedTests,
      sortedGroupEntries,
      testResults,
      testsLoading,
      testsError: testsError?.message,
      toggleExpanded,
      toggleGroupExpanded,
      handleRunTest,
      handleRunGroup,
      handleRunAll,
      handleCreateTest,
      handleHashNavigation,
      setState,
    };
  }, [
    expandedItems,
    expandedGroups,
    emptyGroups,
    editingTestNames,
    tests,
    groupedTests,
    sortedGroupEntries,
    testResults,
    testsLoading,
    testsError,
    toggleExpanded,
    toggleGroupExpanded,
    handleRunTest,
    handleRunGroup,
    handleRunAll,
    handleCreateTest,
    handleHashNavigation,
    setState,
  ]);

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
}

export function useTestContext(): TestContextType {
  return useContextWithError(TestContext);
}
